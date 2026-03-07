import { Link } from 'react-router-dom'

const features = [
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
        ),
        label: 'Face Detection',
        desc: 'Viola-Jones haar-cascade localises the face before inference, improving accuracy on real-world photos.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 20.25h18a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H3a.75.75 0 0 0-.75.75v13.5c0 .414.336.75.75.75Z" />
            </svg>
        ),
        label: 'Image & Video',
        desc: 'Upload a single photo or a video clip. Frames are extracted in-memory and averaged into one prediction.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
            </svg>
        ),
        label: 'Side-by-side Metrics',
        desc: 'Probability bars and confidence scores let you compare how each architecture reasons about the same input.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        ),
        label: 'Pixel Masking',
        desc: 'Randomly mask image patches before sending to the model — explore how robust each architecture is to missing data.',
    },
]

const models = [
    {
        to: '/cnn',
        accent: 'blue',
        tag: 'CNN',
        name: 'Convolutional Neural Network',
        trained: 'FER-2013',
        classes: 7,
        input: '48 × 48 grayscale',
        strengths: ['Lightweight & fast', 'Great at local texture patterns', 'Low memory footprint'],
        desc: 'A classic deep CNN trained on the FER-2013 dataset. It excels at extracting local spatial features through stacked convolution and pooling layers. After Viola-Jones crops the face, the 48 × 48 grayscale patch is fed straight into the network.',
    },
    {
        to: '/vit',
        accent: 'indigo',
        tag: 'ViT',
        name: 'Vision Transformer',
        trained: 'AffectNet (7 classes)',
        classes: 7,
        input: '224 × 224 RGB',
        strengths: ['Global attention mechanism', 'Trained on larger dataset', 'State-of-the-art accuracy'],
        desc: 'A Vision Transformer fine-tuned on AffectNet. It divides the 224 × 224 image into 16 × 16 patches and learns long-range dependencies via self-attention — capturing holistic facial cues that local filters might miss.',
    },
]

const emotions = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
const emotionEmoji = { angry: '😠', disgust: '🤢', fear: '😨', happy: '😊', neutral: '😐', sad: '😢', surprise: '😲' }

export default function Home() {
    return (
        <div className="w-full">
            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <section className="flex flex-col items-center justify-center text-center px-6 py-20 gap-6 bg-linear-to-b from-white to-blue-50">
                <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 bg-blue-100 px-3 py-1 rounded-full">
                    Final-Year Project · 2026
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-3xl">
                    Facial Emotion Recognition<br />
                    <span className="text-blue-600">CNN</span> <span className="text-gray-400 font-light">vs</span>{' '}
                    <span className="text-indigo-600">Vision Transformer</span>
                </h1>
                <p className="text-gray-500 max-w-xl text-base leading-relaxed">
                    Upload a photo or video and instantly compare how a classical convolutional
                    network and a modern attention-based transformer classify facial expressions
                    across <strong>7 emotions</strong>.
                </p>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                    <Link
                        to="/cnn"
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                        Try CNN →
                    </Link>
                    <Link
                        to="/vit"
                        className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Try ViT →
                    </Link>
                </div>

                {/* emotion pills */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {emotions.map((e) => (
                        <span key={e} className="text-sm bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 shadow-sm">
                            {emotionEmoji[e]} {e}
                        </span>
                    ))}
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────────────────── */}
            <section className="px-6 py-16 bg-white">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-10">What this app does</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {features.map(({ icon, label, desc }) => (
                        <div key={label} className="flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-600">{icon}</span>
                            <p className="font-semibold text-gray-800">{label}</p>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Model cards ──────────────────────────────────────────────────── */}
            <section className="px-6 py-16 bg-blue-50">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-10">The two models</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {models.map(({ to, accent, tag, name, trained, classes, input, strengths, desc }) => (
                        <div key={tag} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-${accent}-100 text-${accent}-700`}>
                                    {tag}
                                </span>
                                <h3 className="font-semibold text-gray-800">{name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div>
                                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Trained on</dt>
                                    <dd className="font-medium text-gray-700">{trained}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Classes</dt>
                                    <dd className="font-medium text-gray-700">{classes}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Input size</dt>
                                    <dd className="font-medium text-gray-700">{input}</dd>
                                </div>
                            </dl>
                            <ul className="flex flex-col gap-1">
                                {strengths.map((s) => (
                                    <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className={`w-1.5 h-1.5 rounded-full bg-${accent}-500 shrink-0`} />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={to}
                                className={`mt-auto text-center py-2 rounded-lg bg-${accent}-600 text-white text-sm font-medium hover:bg-${accent}-700 transition-colors`}
                            >
                                Open {tag} →
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────────────────────── */}
            <section className="px-6 py-16 bg-white">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-10">How it works</h2>
                <ol className="max-w-2xl mx-auto flex flex-col gap-6">
                    {[
                        { n: '01', title: 'Upload media', body: 'Choose an image or a video clip from your device. The file never leaves your network — it goes directly to the local backend.' },
                        { n: '02', title: 'Face detection', body: 'The Viola-Jones haar-cascade detector finds and crops the face region. The CNN model uses the crop as input; the ViT receives the full annotated frame.' },
                        { n: '03', title: 'ONNX inference', body: 'The cropped face (CNN) or full frame (ViT) is preprocessed and fed to the respective ONNX model running on the server via onnxruntime-node.' },
                        { n: '04', title: 'Read the results', body: 'A probability distribution over the 7 emotion classes is returned. For videos, per-frame scores are averaged into a single prediction.' },
                    ].map(({ n, title, body }) => (
                        <li key={n} className="flex gap-5">
                            <span className="shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {n}
                            </span>
                            <div>
                                <p className="font-semibold text-gray-800">{title}</p>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    )
}
