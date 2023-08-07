// Glossary of useful terms, in no particular order
// Entries will be sorted alphabetically at display time
// Tags are arbitrary and only used to facilitate searching
const GLOSSARY = [
  {
    term: 'Template prioritizer',
    definition: 'Method for scoring and sorting reaction templates to be applied to a target molecule. The current method used in ASKCOS is the template relevance model.',
    tags: ['retrosynthesis', 'one-step', 'ipp', 'tree builder'],
  },
  {
    term: 'Template relevance model',
    definition: 'A machine learning model trained to identify reaction templates which are most likely to be applicable for a target molecule.',
    tags: ['retrosynthesis', 'one-step', 'ipp', 'tree builder'],
  },
  {
    term: 'Template attribute',
    definition: 'A specific kind of metadata associated with reaction templates which are generated during the template extraction process. These attributes can be used to filter templates before application to select to desirable properties. Currently available attributes include ring delta and chiral delta.',
    tags: ['retrosynthesis', 'one-step', 'ipp'],
  },
  {
    term: 'Ring delta',
    definition: 'A template attribute which represents the average change in the number of rings caused by the transformation, calculated based on the set of training reactions from which a particular reaction template was extracted.',
    tags: ['retrosynthesis', 'one-step', 'ipp'],
  },
  {
    term: 'Chiral delta',
    definition: 'A template attribute which represents the average change in the number of chiral centers caused by the transformation, calculated based on the set of training reactions from which a particular reaction template was extracted.',
    tags: ['retrosynthesis', 'one-step', 'ipp'],
  },
  {
    term: 'Precursor prioritizer',
    definition: 'Method for scoring and sorting precursor sets suggested by the retrosynthesis model.',
    tags: ['retrosynthesis', 'one-step', 'ipp'],
  },
  {
    term: 'Relevance+Heuristic',
    definition: 'A heuristic scoring method for precursors which combines basic molecular attributes with the template score assigned by the template relevance model.',
    tags: ['retrosynthesis', 'one-step', 'ipp'],
  },
  {
    term: 'Synthetic Complexity Score (SCScore)',
    definition: 'A learned score predicted by a machine learning model which was trained on the premise that each step in a synthesis pathway should yield a more syntheticly complex molecule. (J. Chem. Inf. Model. 2018, 58, 2, 252-261)',
    tags: ['evaluation', 'utilities'],
  },
  {
    term: 'Template set',
    definition: 'A set of reaction templates extracted from a particular data source, e.g. Reaxys or Pistachio. May also include custom data sources if models have been trained on internal data.',
    tags: ['retrosynthesis', 'one-step', 'ipp', 'tree builder'],
  },
  {
    term: 'Fast filter',
    definition: 'A machine learning model trained to predict the likelihood that a reaction will actually proceed in the forward direction to form the expected product. The model is trained on a set of positive examples of real reactions augmented with a generated set of negative examples.',
    tags: ['forward', 'synthesis', 'evaluation'],
  },
  {
    term: 'Plausibility',
    definition: 'The likelihood that a reaction will actually proceed in the forward direction to form the expected product. Determined using the fast-filter model.',
    tags: ['forward', 'synthesis', 'evaluation'],
  },
  {
    term: 'Weisfeiler-Lehman Network (WLN)',
    definition: 'A type of graph convolutional network. This is the model architecture used by the reaction outcome predictor and regioselectivity predictor.',
    tags: ['forward', 'synthesis'],
  },
  {
    term: 'QM-WLN',
    definition: 'A WLN which has been augmented with quantum mechanical descriptors, predicted by a separate neural network. This is the model architecture is used by the regioselectivity predictor.',
    tags: ['forward', 'synthesis'],
  },
  {
    term: 'Expansion time',
    definition: 'The walltime allowed for the expansion phase of a tree builder job, during which one-step disconnections are recursively explored to expand the reaction network.',
    tags: ['retrosynthesis', 'tree builder'],
  },
  {
    term: 'Max expansion depth',
    definition: 'The maximum number of linear reaction steps which the tree builder is allowed to explore. Once the algorithm reaches this many reaction steps for a particular pathway, it stops exploring that pathway regardless of whether it successfully led to terminal precursors.',
    tags: ['retrosynthesis', 'tree builder'],
  },
  {
    term: 'Max branching',
    definition: 'The maximum number of precursor suggestions to explore for each intermediate in the reaction network. Once the maximum is reached for a particular intermediate, no more reaction templates will be tried, but already-generated precursors may be explored to a greater depth.',
    tags: ['retrosynthesis', 'tree builder'],
  },
  {
    term: 'Strategic quotient',
    definition: 'A learned score predicted by the tree-LSTM pathway ranking model, which was trained to identify synthesis routes which are most similar to routes extracted from patent data, with the premise that patent pathways should be more strategic. (Chem. Sci. 2021, 12, 1469-1478)',
    tags: ['tree builder', 'evaluation'],
  },
  {
    term: 'Tree-LSTM',
    definition: 'A type of long short-term memory network (a type of recurrent neural network) generalized to tree structures. Used to encode the sequential and branching nature of reaction pathways.',
    tags: ['tree builder', 'evaluation'],
  },
  {
    term: 'Reaction classification',
    definition: 'A machine learning model (based on the BERT model for natural-language processing) trained to predict reaction classes from the NameRXN ontology based on a reaction SMILES string.',
    tags: ['evaluation'],
  },
  {
    term: 'Buyables',
    definition: 'Database of readily available starting materials, which often can be purchased. Used to provide starting material costs in the interactive path planner and tree builder. Used to determine terminal chemicals in the tree builder. Custom building blocks can also be added to the database to improve tree builder results.',
    tags: ['utilities', 'ipp', 'tree builder'],
  },
  {
    term: 'Max cumulative probability (templates)',
    definition: 'In the context of template recommendations, refers to the sum of the scores of the top-n templates. For retrosynthesis predictions, this is used as a cutoff to limit the total number of templates applied.',
    tags: ['retrosynthesis', 'one-step', 'ipp', 'tree builder'],
  },
  {
    term: 'Terminal chemical',
    definition: 'Analogous to starting material. For tree builder jobs, criteria must be set to determine the endpoint of a retrosynthetic pathway. Most commonly, terminal chemicals must be buyable, but alternative criteria such as molecule size or appearance in training data can also be set to expand the scope of pathways returned.',
    tags: ['retrosynthesis', 'tree builder'],
  },
];

export { GLOSSARY };
