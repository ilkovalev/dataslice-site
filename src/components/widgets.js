// Реестр интерактивов: id из lesson → ленивый импорт компонента.
// Используется и классическим LessonLayout, и BeatsLesson.
//
// Раньше все 55 виджетов импортировались статически и целиком лежали в чанке
// страницы уроков: ~1 MB отдавалось ради одного открытого урока. Теперь каждый
// виджет — свой чанк и грузится, только когда его урок реально открыт.
import { lazy } from 'react'

const loaders = {
  distribution: () => import('./DistributionExplorer.jsx'),
  skewness: () => import('./SkewnessExplorer.jsx'),
  'center-measures': () => import('./CenterMeasures.jsx'),
  'two-teams': () => import('./TwoTeams.jsx'),
  histogram: () => import('./Histogram.jsx'),
  'percentile-explorer': () => import('./PercentileExplorer.jsx'),
  'outlier-actions': () => import('./OutlierActions.jsx'),
  'coin-flips': () => import('./CoinFlips.jsx'),
  'events-probability': () => import('./EventsProbability.jsx'),
  'sampling-distribution': () => import('./SamplingDistribution.jsx'),
  'estimator-sampler': () => import('./EstimatorSampler.jsx'),
  'hypothesis-test': () => import('./HypothesisTest.jsx'),
  'ab-test': () => import('./ABTest.jsx'),
  interference: () => import('./Interference.jsx'),
  'metric-roles': () => import('./MetricRoles.jsx'),
  'evidence-pyramid': () => import('./EvidencePyramid.jsx'),
  'ab-process': () => import('./ABProcess.jsx'),
  regression: () => import('./Regression.jsx'),
  'regression-metrics': () => import('./RegressionMetrics.jsx'),
  'multiple-regression': () => import('./MultipleRegression.jsx'),
  'residual-diagnostics': () => import('./ResidualDiagnostics.jsx'),
  'correlation-shapes': () => import('./CorrelationShapes.jsx'),
  'regression-to-mean': () => import('./RegressionToMean.jsx'),
  classifier: () => import('./Classifier.jsx'),
  'feature-classifier': () => import('./FeatureClassifier.jsx'),
  'pr-curve': () => import('./PRCurve.jsx'),
  'bayes-grid': () => import('./BayesGrid.jsx'),
  'random-variable': () => import('./RandomVariable.jsx'),
  'prior-posterior': () => import('./PriorPosterior.jsx'),
  'bayesian-ab': () => import('./BayesianAB.jsx'),
  'naive-bayes': () => import('./NaiveBayes.jsx'),
  anova: () => import('./ANOVA.jsx'),
  'interaction-plot': () => import('./InteractionPlot.jsx'),
  'pairwise-intervals': () => import('./PairwiseIntervals.jsx'),
  'data-case-study': () => import('./DataCaseStudy.jsx'),
  'confidence-intervals': () => import('./ConfidenceIntervals.jsx'),
  'ci-vs-p': () => import('./CIvsP.jsx'),
  'simpson-paradox': () => import('./SimpsonParadox.jsx'),
  'causal-diagram': () => import('./CausalDiagram.jsx'),
  'power-curve': () => import('./PowerCurve.jsx'),
  peeking: () => import('./Peeking.jsx'),
  roc: () => import('./ROC.jsx'),
  overfitting: () => import('./Overfitting.jsx'),
  'data-leakage': () => import('./DataLeakage.jsx'),
  survivorship: () => import('./SurvivorshipBias.jsx'),
  'multiple-comparisons': () => import('./MultipleComparisons.jsx'),
  goodhart: () => import('./Goodhart.jsx'),
  bootstrap: () => import('./Bootstrap.jsx'),
  't-test': () => import('./TTest.jsx'),
  'z-test': () => import('./ZTest.jsx'),
  'mann-whitney': () => import('./MannWhitney.jsx'),
  'variance-reduction': () => import('./VarianceReduction.jsx'),
  'criterion-picker': () => import('./CriterionPicker.jsx'),
  'p-value-explorer': () => import('./PValueExplorer.jsx'),
  'sequential-test': () => import('./SequentialTest.jsx'),
  'ts-decomposition': () => import('./TimeSeriesDecomposition.jsx'),
  autocorrelation: () => import('./Autocorrelation.jsx'),
  stationarity: () => import('./Stationarity.jsx'),
  'smoothing-forecast': () => import('./SmoothingForecast.jsx'),
  'arima-builder': () => import('./ArimaBuilder.jsx'),
  'forecast-backtest': () => import('./ForecastBacktest.jsx'),
}

// React.lazy на каждый id, созданный один раз: пересоздание на рендере
// размонтировало бы виджет и сбрасывало его состояние.
export const widgets = Object.fromEntries(
  Object.entries(loaders).map(([id, load]) => [id, lazy(load)]),
)
