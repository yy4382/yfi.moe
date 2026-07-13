# Ingest content collections independently

Posts, pages, and image metadata each reconcile as an independent content collection with their own source revision. Image metadata may enrich posts when they are rendered, but it does not participate in post ingestion; we accept temporary differences between collections to keep ingestion local to Astro's per-collection loader seam and avoid cross-collection coordination.
