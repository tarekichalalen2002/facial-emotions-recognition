"""
Export fer_model_transfered_knowledge.pth to ONNX format.

Model: FERClassifier — a ViT-base/16 encoder (depth=6, MAE-pretrained)
       fine-tuned on FER-2013 with AffectNet transfer learning.
Input:  [1, 3, 224, 224]  (RGB, ImageNet normalisation)
Output: [1, 7]            (logits for 7 emotion classes)

Classes (index order):
  0 neutral | 1 happy | 2 sad | 3 surprise | 4 fear | 5 disgust | 6 anger
"""

import os
import torch
import torch.nn as nn
import timm

# ---------------------------------------------------------------------------
# Model definition  (must match the training code exactly)
# ---------------------------------------------------------------------------

class FERClassifier(nn.Module):
    def __init__(self, mae_encoder, num_classes: int = 7):
        super().__init__()
        self.encoder = mae_encoder
        self.classifier = nn.Sequential(
            nn.LayerNorm(mae_encoder.embed_dim),
            nn.Linear(mae_encoder.embed_dim, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        tokens = self.encoder.patch_embed(x)                          # (B, 196, 768)
        cls_token = self.encoder.cls_token.expand(x.size(0), -1, -1) # (B, 1, 768)
        x = torch.cat((cls_token, tokens), dim=1)                     # (B, 197, 768)
        x = x + self.encoder.pos_embed[:, : x.size(1), :]
        x = self.encoder.pos_drop(x)
        for blk in self.encoder.blocks:
            x = blk(x)
        x = self.encoder.norm(x)
        cls_embedding = x[:, 0]                                       # (B, 768)
        return self.classifier(cls_embedding)                         # (B, 7)


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(SCRIPT_DIR, "..",  "output", "affectNet-7-emotions.pth")
ONNX_PATH    = os.path.join(SCRIPT_DIR, "..",  "output", "affectNet-7-emotions.onnx")


# ---------------------------------------------------------------------------
# Build model
# ---------------------------------------------------------------------------

def build_model() -> FERClassifier:
    encoder = timm.create_model(
        "vit_base_patch16_224",
        pretrained=False,
        img_size=224,
        patch_size=16,
        embed_dim=768,
        depth=6,
        num_heads=12,
        mlp_ratio=4.0,
    )
    return FERClassifier(mae_encoder=encoder, num_classes=7)


# ---------------------------------------------------------------------------
# Load weights
# ---------------------------------------------------------------------------

def load_weights(model: FERClassifier, path: str) -> FERClassifier:
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Checkpoint not found: {path}")

    checkpoint = torch.load(path, map_location="cpu")

    # The checkpoint is saved as {"model_state_dict": ...}
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)
    print(f"Loaded weights from: {path}")
    return model


# ---------------------------------------------------------------------------
# Export to ONNX
# ---------------------------------------------------------------------------

def export_onnx(model: FERClassifier, output_path: str) -> None:
    model.eval()

    dummy_input = torch.zeros(1, 3, 224, 224)

    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={
            "input":  {0: "batch_size"},
            "logits": {0: "batch_size"},
        },
    )
    size_mb = os.path.getsize(output_path) / (1024 ** 2)
    print(f"ONNX model saved to: {output_path}  ({size_mb:.1f} MB)")


# ---------------------------------------------------------------------------
# Optional: verify with onnxruntime
# ---------------------------------------------------------------------------

def verify_onnx(onnx_path: str) -> None:
    try:
        import onnxruntime as ort
        import numpy as np

        session = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
        dummy = np.zeros((1, 3, 224, 224), dtype=np.float32)
        outputs = session.run(None, {"input": dummy})
        print(f"ONNX runtime check passed. Output shape: {outputs[0].shape}")
    except ImportError:
        print("onnxruntime not installed — skipping verification.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    model = build_model()
    model = load_weights(model, WEIGHTS_PATH)

    export_onnx(model, ONNX_PATH)
    verify_onnx(ONNX_PATH)
