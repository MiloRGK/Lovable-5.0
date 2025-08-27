// Advanced metrics and analytics for the Lovable coder system

export interface CoderMetrics {
  operation: 'plan' | 'compose' | 'iterate';
  model: 'gpt-5' | 'gpt-5-mini';
  reasoning_effort: 'minimal' | 'low' | 'medium' | 'high';
  text_verbosity: 'low' | 'medium' | 'high';
  tokens_used: number;
  response_time_ms: number;
  success: boolean;
  error?: string;
  project_id: string;
  timestamp: Date;
}

export class CoderAnalytics {
  private metrics: CoderMetrics[] = [];
  private readonly maxMetrics = 1000; // Limit memory usage

  // Record a metric
  record(metric: CoderMetrics): void {
    this.metrics.push(metric);
    
    // Cleanup old metrics if we're at the limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetrics * 0.8));
    }
  }

  // Get metrics for a specific project
  getProjectMetrics(projectId: string): CoderMetrics[] {
    return this.metrics.filter(m => m.project_id === projectId);
  }

  // Get metrics for a specific operation
  getOperationMetrics(operation: CoderMetrics['operation']): CoderMetrics[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  // Get average response time for an operation
  getAverageResponseTime(operation?: CoderMetrics['operation']): number {
    const filtered = operation ? this.getOperationMetrics(operation) : this.metrics;
    if (filtered.length === 0) return 0;
    
    return filtered.reduce((sum, m) => sum + m.response_time_ms, 0) / filtered.length;
  }

  // Get average tokens used for an operation
  getAverageTokens(operation?: CoderMetrics['operation']): number {
    const filtered = operation ? this.getOperationMetrics(operation) : this.metrics;
    if (filtered.length === 0) return 0;
    
    return filtered.reduce((sum, m) => sum + m.tokens_used, 0) / filtered.length;
  }

  // Get success rate for an operation
  getSuccessRate(operation?: CoderMetrics['operation']): number {
    const filtered = operation ? this.getOperationMetrics(operation) : this.metrics;
    if (filtered.length === 0) return 0;
    
    const successful = filtered.filter(m => m.success).length;
    return successful / filtered.length;
  }

  // Get cost estimate (rough calculation)
  getCostEstimate(operation?: CoderMetrics['operation']): number {
    const filtered = operation ? this.getOperationMetrics(operation) : this.metrics;
    
    // Rough cost estimates per 1K tokens (as of 2024)
    const costs = {
      'gpt-5': 0.05, // Higher cost for GPT-5
      'gpt-5-mini': 0.002 // Lower cost for GPT-5-mini
    };
    
    return filtered.reduce((total, m) => {
      const tokensInK = m.tokens_used / 1000;
      const costPerK = costs[m.model] || 0.01;
      return total + (tokensInK * costPerK);
    }, 0);
  }

  // Get recent metrics
  getRecentMetrics(hours = 24): CoderMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  // Get summary statistics
  getSummary(): {
    totalOperations: number;
    totalTokens: number;
    estimatedCost: number;
    averageResponseTime: number;
    successRate: number;
    modelUsage: Record<string, number>;
    operationCounts: Record<string, number>;
  } {
    const totalOperations = this.metrics.length;
    const totalTokens = this.metrics.reduce((sum, m) => sum + m.tokens_used, 0);
    const estimatedCost = this.getCostEstimate();
    const averageResponseTime = this.getAverageResponseTime();
    const successRate = this.getSuccessRate();

    // Model usage breakdown
    const modelUsage: Record<string, number> = {};
    this.metrics.forEach(m => {
      modelUsage[m.model] = (modelUsage[m.model] || 0) + 1;
    });

    // Operation counts
    const operationCounts: Record<string, number> = {};
    this.metrics.forEach(m => {
      operationCounts[m.operation] = (operationCounts[m.operation] || 0) + 1;
    });

    return {
      totalOperations,
      totalTokens,
      estimatedCost,
      averageResponseTime,
      successRate,
      modelUsage,
      operationCounts
    };
  }
}

// Global analytics instance
export const coderAnalytics = new CoderAnalytics();

// Wrapper function to measure AI operations
export async function withMetrics<T>(
  operation: CoderMetrics['operation'],
  model: CoderMetrics['model'],
  reasoning_effort: CoderMetrics['reasoning_effort'],
  text_verbosity: CoderMetrics['text_verbosity'],
  fn: () => Promise<T>,
  projectId: string
): Promise<{ result: T; tokensUsed: number; model: string }> {
  const startTime = Date.now();
  let tokensUsed = 0;
  let actualModel = model;
  let success = false;
  let error: string | undefined;

  try {
    const result = await fn();
    
    // Extract token usage if available
    if (typeof result === 'object' && result !== null) {
      const resultObj = result as any;
      tokensUsed = resultObj.tokensUsed || resultObj.usage?.total_tokens || 0;
      actualModel = resultObj.model || model;
    }
    
    success = true;
    return { result, tokensUsed, model: actualModel };
    
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    throw err;
    
  } finally {
    const responseTimeMs = Date.now() - startTime;
    
    // Record the metric
    coderAnalytics.record({
      operation,
      model: actualModel as CoderMetrics['model'],
      reasoning_effort,
      text_verbosity,
      tokens_used: tokensUsed,
      response_time_ms: responseTimeMs,
      success,
      error,
      project_id: projectId,
      timestamp: new Date()
    });
  }
}