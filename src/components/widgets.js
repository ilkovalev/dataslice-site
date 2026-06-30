// Общий реестр интерактивов: id из lesson → компонент.
// Используется и классическим LessonLayout, и BeatsLesson.
import DistributionExplorer from './DistributionExplorer.jsx'
import SkewnessExplorer from './SkewnessExplorer.jsx'
import CenterMeasures from './CenterMeasures.jsx'
import TwoTeams from './TwoTeams.jsx'
import Histogram from './Histogram.jsx'
import PercentileExplorer from './PercentileExplorer.jsx'
import OutlierActions from './OutlierActions.jsx'
import CoinFlips from './CoinFlips.jsx'
import EventsProbability from './EventsProbability.jsx'
import SamplingDistribution from './SamplingDistribution.jsx'
import EstimatorSampler from './EstimatorSampler.jsx'
import HypothesisTest from './HypothesisTest.jsx'
import ABTest from './ABTest.jsx'
import Interference from './Interference.jsx'
import MetricRoles from './MetricRoles.jsx'
import EvidencePyramid from './EvidencePyramid.jsx'
import ABProcess from './ABProcess.jsx'
import Regression from './Regression.jsx'
import RegressionMetrics from './RegressionMetrics.jsx'
import MultipleRegression from './MultipleRegression.jsx'
import ResidualDiagnostics from './ResidualDiagnostics.jsx'
import CorrelationShapes from './CorrelationShapes.jsx'
import RegressionToMean from './RegressionToMean.jsx'
import Classifier from './Classifier.jsx'
import FeatureClassifier from './FeatureClassifier.jsx'
import PRCurve from './PRCurve.jsx'
import BayesGrid from './BayesGrid.jsx'
import RandomVariable from './RandomVariable.jsx'
import PriorPosterior from './PriorPosterior.jsx'
import BayesianAB from './BayesianAB.jsx'
import NaiveBayes from './NaiveBayes.jsx'
import ANOVA from './ANOVA.jsx'
import InteractionPlot from './InteractionPlot.jsx'
import PairwiseIntervals from './PairwiseIntervals.jsx'
import DataCaseStudy from './DataCaseStudy.jsx'
import ConfidenceIntervals from './ConfidenceIntervals.jsx'
import CIvsP from './CIvsP.jsx'
import SimpsonParadox from './SimpsonParadox.jsx'
import CausalDiagram from './CausalDiagram.jsx'
import PowerCurve from './PowerCurve.jsx'
import Peeking from './Peeking.jsx'
import ROC from './ROC.jsx'
import Overfitting from './Overfitting.jsx'
import DataLeakage from './DataLeakage.jsx'
import SurvivorshipBias from './SurvivorshipBias.jsx'
import MultipleComparisons from './MultipleComparisons.jsx'
import Goodhart from './Goodhart.jsx'
import Bootstrap from './Bootstrap.jsx'
import TTest from './TTest.jsx'
import ZTest from './ZTest.jsx'
import MannWhitney from './MannWhitney.jsx'
import VarianceReduction from './VarianceReduction.jsx'
import CriterionPicker from './CriterionPicker.jsx'
import PValueExplorer from './PValueExplorer.jsx'

export const widgets = {
  distribution: DistributionExplorer,
  skewness: SkewnessExplorer,
  'center-measures': CenterMeasures,
  'two-teams': TwoTeams,
  histogram: Histogram,
  'percentile-explorer': PercentileExplorer,
  'outlier-actions': OutlierActions,
  'coin-flips': CoinFlips,
  'events-probability': EventsProbability,
  'sampling-distribution': SamplingDistribution,
  'estimator-sampler': EstimatorSampler,
  'hypothesis-test': HypothesisTest,
  'ab-test': ABTest,
  interference: Interference,
  'metric-roles': MetricRoles,
  'evidence-pyramid': EvidencePyramid,
  'ab-process': ABProcess,
  regression: Regression,
  'regression-metrics': RegressionMetrics,
  'multiple-regression': MultipleRegression,
  'residual-diagnostics': ResidualDiagnostics,
  'correlation-shapes': CorrelationShapes,
  'regression-to-mean': RegressionToMean,
  classifier: Classifier,
  'feature-classifier': FeatureClassifier,
  'pr-curve': PRCurve,
  'bayes-grid': BayesGrid,
  'random-variable': RandomVariable,
  'prior-posterior': PriorPosterior,
  'bayesian-ab': BayesianAB,
  'naive-bayes': NaiveBayes,
  anova: ANOVA,
  'interaction-plot': InteractionPlot,
  'pairwise-intervals': PairwiseIntervals,
  'data-case-study': DataCaseStudy,
  'confidence-intervals': ConfidenceIntervals,
  'ci-vs-p': CIvsP,
  'simpson-paradox': SimpsonParadox,
  'causal-diagram': CausalDiagram,
  'power-curve': PowerCurve,
  peeking: Peeking,
  roc: ROC,
  overfitting: Overfitting,
  'data-leakage': DataLeakage,
  survivorship: SurvivorshipBias,
  'multiple-comparisons': MultipleComparisons,
  goodhart: Goodhart,
  bootstrap: Bootstrap,
  't-test': TTest,
  'z-test': ZTest,
  'mann-whitney': MannWhitney,
  'variance-reduction': VarianceReduction,
  'criterion-picker': CriterionPicker,
  'p-value-explorer': PValueExplorer,
}
