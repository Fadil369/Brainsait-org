/**
 * Document Ingestion — chunk text and upsert into Vectorize
 */

export async function ingestDocument(
  text: string,
  key: string,
  index: VectorizeIndex,
  ai: Ai,
  chunkSize = 512,
  extraMetadata: Record<string, string> = {},
): Promise<number> {
  // Split into overlapping chunks
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  const overlap = 50;

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 20) chunks.push(chunk);
  }

  if (!chunks.length) return 0;

  // Batch embed (up to 100 at a time)
  const batchSize = 50;
  let indexed = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const embedResult = await (ai as any).run('@cf/baai/bge-large-en-v1.5', { text: batch }) as any;
    const embeddings: number[][] = embedResult?.data ?? embedResult;

    const vectors = embeddings.map((vec: number[], j: number) => ({
      id: `${key}-chunk-${i + j}`,
      values: vec,
      metadata: {
          key,
          chunkIndex: i + j,
          text: batch[j].slice(0, 500),
          title: key.split('/').pop() ?? key,
          ...extraMetadata,
        },
    }));

    await index.upsert(vectors);
    indexed += vectors.length;
  }

  return indexed;
}
