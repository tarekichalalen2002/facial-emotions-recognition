"""
Export CNN_FER.pth to ONNX format.

Model: FERResNet18 — ResNet-18 backbone with a single-channel first conv layer,
       trained on FER-2013 (grayscale 48x48).
Input:  [1, 1, 48, 48]  (grayscale, normalised with mean=0.5, std=0.5)
Output: [1, 7]           (logits for 7 emotion classes)

Classes (index order):
  0 angry | 1 disgust | 2 fear | 3 happy | 4 neutral | 5 sad | 6 surprise
"""

import os
import torch
import torch.nn as nn
from torchvision import models

# ---------------------------------------------------------------------------
# Model definition  (must match the training code exactly)
# ---------------------------------------------------------------------------

class FERResNet18(nn.Module):
    def __init__(self, num_classes: int = 7):
        super().__init__()
        self.model = models.resnet18(weights=None)
        self.model.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
        self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(SCRIPT_DIR, "..",  "output", "CNN_FER.pth")
ONNX_PATH    = os.path.join(SCRIPT_DIR, "..",  "output", "CNN_FER.onnx")


# ---------------------------------------------------------------------------
# Build model
# ---------------------------------------------------------------------------

def build_model() -> FERResNet18:
    return FERResNet18(num_classes=7)


# ---------------------------------------------------------------------------
# Load weights
# ---------------------------------------------------------------------------

def load_weights(model: FERResNet18, path: str) -> FERResNet18:
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Checkpoint not found: {path}")

    checkpoint = torch.load(path, map_location="cpu")

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

def export_onnx(model: FERResNet18, output_path: str) -> None:
    model.eval()

    dummy_input = torch.zeros(1, 1, 48, 48)

    batch = torch.export.Dim("batch_size")
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=18,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["logits"],
        dynamic_shapes={"x": {0: batch}},
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
        dummy = np.zeros((1, 1, 48, 48), dtype=np.float32)
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
