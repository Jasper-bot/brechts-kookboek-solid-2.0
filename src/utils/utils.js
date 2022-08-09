
import {
    createSolidDataset,
    getSolidDataset,
    saveSolidDatasetAt,
  } from "@inrupt/solid-client";

export async function getOrCreateCommentDataset(containerUri, fetch){
    const indexUrl = `${containerUri}index.ttl`;
    try {
        const commentList = await getSolidDataset(indexUrl, { fetch });
        return commentList;
      } catch (error) {
        if (error.statusCode === 404) {
          const commentList = await saveSolidDatasetAt(
            indexUrl,
            createSolidDataset(),
            {
              fetch,
            }
          );
          return commentList;
        }
      }
}