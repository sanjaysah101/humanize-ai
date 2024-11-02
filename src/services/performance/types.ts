export interface PerformanceMetrics {
  executionTime: number; // in milliseconds
  memoryUsage: number; // in bytes
  transformationCount: number;
  cpuUsage?: number; // optional CPU usage metric
  resourceEfficiency?: {
    // optional detailed metrics
    transformationsPerSecond: number;
    memoryPerTransformation: number;
  };
}
