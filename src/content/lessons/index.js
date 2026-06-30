// Реестр уроков стр. 1, сгруппированный по модулю.
// Каждый урок — отдельный JSON по шаблону концепт-юнита.
import centerMeasures from './center-measures.json'
import spread from './spread.json'
import histogram from './histogram.json'
import percentiles from './percentiles.json'
import outliers from './outliers.json'
import normalDistribution from './normal-distribution.json'
import discreteDistributions from './discrete-distributions.json'
import continuousDistributions from './continuous-distributions.json'
import skewTail from './skew-tail.json'
import identifyDistribution from './identify-distribution.json'
import probabilityBasics from './probability-basics.json'
import probabilityLln from './probability-lln.json'
import samplingStatistic from './sampling-statistic.json'
import clt from './clt.json'
import hypothesisIntro from './hypothesis-intro.json'
import hypothesisTest from './hypothesis-test.json'
import evidencePyramid from './evidence-pyramid.json'
import abTest from './ab-test.json'
import experimentMetrics from './experiment-metrics.json'
import segmentsCate from './segments-cate.json'
import abProcess from './ab-process.json'
import regression from './regression.json'
import correlationTypes from './correlation-types.json'
import regressionMetrics from './regression-metrics.json'
import regressionAssumptions from './regression-assumptions.json'
import multipleRegression from './multiple-regression.json'
import causality from './causality.json'
import classification from './classification.json'
import confusionMatrix from './confusion-matrix.json'
import conditionalBayes from './conditional-bayes.json'
import randomVariable from './random-variable.json'
import confidenceIntervals from './confidence-intervals.json'
import simpsonParadox from './simpson-paradox.json'
import regressionToMean from './regression-to-mean.json'
import powerSampleSize from './power-sample-size.json'
import networkEffects from './network-effects.json'
import peeking from './peeking.json'
import sequentialTests from './sequential-tests.json'
import roc from './roc.json'
import classImbalance from './class-imbalance.json'
import overfitting from './overfitting.json'
import bootstrap from './bootstrap.json'
import tTest from './t-test.json'
import ciVsPvalue from './ci-vs-pvalue.json'
import varianceReduction from './variance-reduction.json'
import survivorshipBias from './survivorship-bias.json'
import multipleComparisons from './multiple-comparisons.json'
import dataLeakage from './data-leakage.json'
import goodhart from './goodhart.json'
import bayesianInference from './bayesian-inference.json'
import bayesianAb from './bayesian-ab.json'
import naiveBayes from './naive-bayes.json'
import anova from './anova.json'
import posthocAnova from './posthoc-anova.json'
import twoWayAnova from './two-way-anova.json'
import capstoneProject from './capstone-project.json'

export const lessons = [
  centerMeasures, spread, histogram, percentiles, outliers,
  probabilityBasics, probabilityLln, conditionalBayes, randomVariable,
  normalDistribution, discreteDistributions, continuousDistributions, skewTail, identifyDistribution,
  samplingStatistic, clt, confidenceIntervals, bootstrap,
  hypothesisIntro, hypothesisTest, tTest, ciVsPvalue, powerSampleSize, varianceReduction,
  evidencePyramid, abTest, experimentMetrics, segmentsCate, multipleComparisons, abProcess, networkEffects, peeking, sequentialTests,
  regression, correlationTypes, regressionMetrics, regressionAssumptions, multipleRegression, causality,
  classification, confusionMatrix, roc, classImbalance, overfitting,
  survivorshipBias, simpsonParadox, regressionToMean, dataLeakage, goodhart,
  bayesianInference, bayesianAb, naiveBayes, anova, posthocAnova, twoWayAnova,
  capstoneProject,
]

export const lessonsByModule = lessons.reduce((acc, l) => {
  ;(acc[l.module] ||= []).push(l)
  return acc
}, {})
