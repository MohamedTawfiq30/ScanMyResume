let pipelineInstance: any = null;
let loading = false;

export async function loadModel(onProgress?: (msg: string) => void): Promise<void> {
  if (pipelineInstance) return;
  if (loading) {
    // Wait for existing load
    while (loading) {
      await new Promise(r => setTimeout(r, 200));
    }
    return;
  }
  
  loading = true;
  try {
    onProgress?.('Loading AI model...');
    const { pipeline } = await import('@xenova/transformers');
    onProgress?.('Downloading model weights...');
    pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (data: any) => {
        if (data.status === 'progress' && data.progress) {
          onProgress?.(`Downloading: ${Math.round(data.progress)}%`);
        }
      },
    });
    onProgress?.('Model ready!');
  } catch (e) {
    console.error('Failed to load model:', e);
    throw e;
  } finally {
    loading = false;
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  if (!pipelineInstance) {
    await loadModel();
  }
  const truncated = text.slice(0, 512);
  const output = await pipelineInstance(truncated, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
