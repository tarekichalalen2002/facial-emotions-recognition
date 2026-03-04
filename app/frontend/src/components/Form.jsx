import { useState, useEffect, useRef } from 'react'

// ─── Masking utility (images only) ───────────────────────────────────────────

/**
 * Draw the image onto an offscreen canvas, paint random-coloured blocks over
 * a random fraction of it, then return { blob, url } for the masked result.
 * If ratio === 0 the original file is returned unchanged.
 */
const applyMasking = (file, ratio, blockSize) =>
    new Promise((resolve) => {
        if (!file || ratio === 0) {
            resolve({ blob: file, url: URL.createObjectURL(file) })
            return
        }

        const rawUrl = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width  = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            URL.revokeObjectURL(rawUrl)

            const cols = Math.floor(img.naturalWidth  / blockSize)
            const rows = Math.floor(img.naturalHeight / blockSize)
            const total = cols * rows
            const numMask = Math.round(ratio * total)

            const idx = Array.from({ length: total }, (_, i) => i)
            for (let i = 0; i < numMask; i++) {
                const j = i + Math.floor(Math.random() * (total - i))
                ;[idx[i], idx[j]] = [idx[j], idx[i]]
            }

            for (let i = 0; i < numMask; i++) {
                const col = idx[i] % cols
                const row = Math.floor(idx[i] / cols)
                ctx.fillStyle = `rgb(${Math.random()*255|0},${Math.random()*255|0},${Math.random()*255|0})`
                ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize)
            }

            canvas.toBlob(
                (blob) => resolve({ blob, url: URL.createObjectURL(blob) }),
                'image/jpeg',
                0.95,
            )
        }
        img.src = rawUrl
    })

// ─── Upload Zone ─────────────────────────────────────────────────────────────

const UploadZone = ({ id, accept, label, onFileChange, disabled, previewOverride }) => {
    const [fileName, setFileName] = useState(null)
    const [rawUrl,   setRawUrl]   = useState(null)
    const [fileType, setFileType] = useState(null)

    useEffect(() => {
        return () => { if (rawUrl) URL.revokeObjectURL(rawUrl) }
    }, [rawUrl])

    const handleChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (rawUrl) URL.revokeObjectURL(rawUrl)
        setFileName(file.name)
        setFileType(file.type.startsWith('video') ? 'video' : 'image')
        setRawUrl(URL.createObjectURL(file))
        onFileChange(file)
    }

    const displayUrl = previewOverride ?? rawUrl

    return (
        <label
            htmlFor={disabled ? undefined : id}
            className={`relative border-2 border-dashed rounded-md w-full h-[50vh] flex flex-col items-center justify-center gap-2 overflow-hidden transition-colors
                ${disabled ? 'border-gray-200 cursor-not-allowed' : 'border-gray-300 cursor-pointer hover:border-blue-400 group'}`}
        >
            {displayUrl && fileType === 'image' && (
                <img src={displayUrl} alt="preview" className="absolute inset-0 w-full h-full object-contain" />
            )}
            {displayUrl && fileType === 'video' && (
                <video src={displayUrl} className="absolute inset-0 w-full h-full object-contain" preload="metadata" muted />
            )}

            {/* Inference loading overlay */}
            {disabled && displayUrl && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-10">
                    <svg className="w-10 h-10 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-white text-sm font-medium">Analysing…</span>
                </div>
            )}

            {/* Hover overlay */}
            {!disabled && (
                <div className={`${displayUrl ? 'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100' : ''} flex flex-col items-center justify-center gap-2 transition-opacity p-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-10 h-10 ${displayUrl ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className={`text-sm text-center ${displayUrl ? 'text-white' : 'text-gray-500'}`}>
                        {fileName ?? label}
                    </span>
                </div>
            )}

            <input type="file" id={id} accept={accept} className="hidden" onChange={handleChange} disabled={disabled} />
        </label>
    )
}

// ─── Result Panel ─────────────────────────────────────────────────────────────

const EMOTION_COLORS = {
    happy:    'bg-yellow-400',
    neutral:  'bg-gray-400',
    sad:      'bg-blue-400',
    angry:    'bg-red-500',  // CNN label
    anger:    'bg-red-500',  // ViT label
    surprise: 'bg-orange-400',
    fear:     'bg-purple-400',
    disgust:  'bg-green-600',
}

const ResultPanel = ({ result, loading, error }) => {
    if (loading) return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
                <svg className="w-10 h-10 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Running inference…</span>
            </div>
        </div>
    )

    if (error) return (
        <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-500 text-sm text-center px-4">{error}</p>
        </div>
    )

    if (!result) return (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Results will appear here
        </div>
    )

    const sortedProbs = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4 overflow-y-auto">
            {result.annotatedImage && (
                <img src={result.annotatedImage} alt="annotated" className="w-full rounded-md object-contain max-h-56 border border-gray-200" />
            )}
            <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold capitalize">{result.label}</span>
                <span className="text-lg font-medium text-blue-600">{result.confidence}%</span>
            </div>
            {result.frameCount && (
                <p className="text-xs text-gray-400">Averaged over {result.frameCount} frames</p>
            )}
            <div className="flex flex-col gap-2">
                {sortedProbs.map(([emotion, prob]) => (
                    <div key={emotion}>
                        <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                            <span className="capitalize">{emotion}</span>
                            <span>{prob}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${EMOTION_COLORS[emotion] ?? 'bg-blue-400'}`}
                                style={{ width: `${prob}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const Form = ({ defaultTarget = 'image', model = 'cnn' }) => {
    const [target,        setTarget]        = useState(defaultTarget)
    const [file,          setFile]          = useState(null)
    const [maskedBlob,    setMaskedBlob]    = useState(null)
    const [maskedUrl,     setMaskedUrl]     = useState(null)    
    const [result,        setResult]        = useState(null)
    const [loading,       setLoading]       = useState(false)
    const [error,         setError]         = useState(null)
    const [maskingRatio,  setMaskingRatio]  = useState(0)
    const [maskingBlocks, setMaskingBlocks] = useState(15)
    const resultRef = useRef(null)

    // Re-apply masking whenever the file or masking params change — images only
    useEffect(() => {
        if (!file || target !== 'image') {
            setMaskedBlob(null)
            setMaskedUrl(null)
            return
        }
        let cancelled = false
        applyMasking(file, maskingRatio, maskingBlocks).then(({ blob, url }) => {
            if (cancelled) { URL.revokeObjectURL(url); return }
            setMaskedBlob(blob)
            setMaskedUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url })
        })
        return () => { cancelled = true }
    }, [file, maskingRatio, maskingBlocks, target])

    const handleTargetChange = (newTarget) => {
        setTarget(newTarget)
        setFile(null)
        setMaskedBlob(null)
        setMaskedUrl(null)
        setResult(null)
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) { setError('Please select a file first.'); return }

        const isVideo  = target === 'video'
        const endpoint = `/api/v1/${model}/${isVideo ? 'predict-video' : 'predict'}`
        const payload  = new FormData()
        payload.append(isVideo ? 'video' : 'image', isVideo ? file : (maskedBlob ?? file))

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch(endpoint, { method: 'POST', body: payload })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error ?? `Server error ${res.status}`)
            }
            setResult(await res.json())
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left — upload */}
            <form onSubmit={handleSubmit} className="w-full min-h-[600px] flex flex-col items-center gap-4">

                {/* Image / Video toggle */}
                <div className="flex rounded-md overflow-hidden border border-gray-300">
                    {['image', 'video'].map((t) => (
                        <button key={t} type="button" onClick={() => handleTargetChange(t)}
                            className={`px-4 py-1.5 text-sm capitalize transition-colors ${target === t ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {target === 'image' ? (
                    <UploadZone key="image" id="image" accept="image/*"
                        label="Drag and drop your image here or click to upload"
                        onFileChange={setFile} disabled={loading}
                        previewOverride={maskedUrl} />
                ) : (
                    <UploadZone key="video" id="video" accept="video/*"
                        label="Drag and drop your video here or click to upload"
                        onFileChange={setFile} disabled={loading} />
                )}

                {/* Masking controls — image mode only */}
                {target === 'image' && (
                    <div className="w-full flex flex-col gap-3 px-1">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Mask ratio</span>
                                <span className="font-medium">{Math.round(maskingRatio * 100)}%</span>
                            </div>
                            <input type="range" min={0} max={1} step={0.05} value={maskingRatio}
                                onChange={(e) => setMaskingRatio(parseFloat(e.target.value))}
                                disabled={loading}
                                className="w-full accent-blue-500 disabled:opacity-40" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Block size</span>
                                <span className="font-medium">{maskingBlocks} px</span>
                            </div>
                            <input type="range" min={5} max={60} step={5} value={maskingBlocks}
                                onChange={(e) => setMaskingBlocks(parseInt(e.target.value))}
                                disabled={loading}
                                className="w-full accent-blue-500 disabled:opacity-40" />
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading || !file}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors cursor-pointer">
                    {loading ? 'Running…' : 'Predict'}
                </button>
            </form>

            {/* Right — results */}
            <div ref={resultRef} className="w-full min-h-[600px] border border-gray-200 rounded-md">
                <ResultPanel result={result} loading={loading} error={error} />
            </div>
        </div>
    )
}

export default Form
