[see the deployed beta](https://fallacy-detector.com/)

# fallacy-detector
code repository for fallacy-detector application

# training
students at san diego state university constructed individual binary classifiers on 10 different logical fallacies. These were jupyter notebooks using the BertTokenizer from nltk to extract features from *labeled data*, data is split into train/test sets, then loads a pretrained BERT model with a classification head using AdamW optimizer (preferred for Transformers). Performance metrics are obtained from the test set, the goal is probabilistic multi-classification.

**labeled data** data is synthetically generated via language learning models -- prompts like "do you know what ad hominem is? can you generate 100 examples in a python list for me? 100 non examples?". We additionally leveraged the coco dataset of logical fallacies for non-synthetic examples.

these notebooks were refactored into a single deployed databricks notebook (see [training pipeline](https://github.com/lramos0/fallacy-detector/blob/main/databricks/notebooks/Fallacy-Multi-Classifier-Training.ipynb)) which produces an MLflow model to serve inferences over https. Data was ultimately loaded into hive tables to facilitate simpler ETL (see table initialization)[https://github.com/lramos0/fallacy-detector/blob/main/databricks/notebooks/Logical-Fallacy-Data-Management.ipynb]

# model serving
Databricks is nicely integrated with MLflow, so we were able to publish necessary artifacts and serve our classifier under the `models` section. Realistically we'd look into publishing these contianers to a separate registry and leverage an in-house k8s approach since deferring completely to databricks comes with a premium $$$. This is why the current version of this requires a personal access token to eliminate excessive usage.

```bash
curl -X POST https://dbc-28e35821-942c.cloud.databricks.com/serving-endpoints/fallacy-classifier/invocations \
  -H "Authorization: Bearer {beta-token}" \
  -H "Content-Type: application/json" \
  -d '{
        "dataframe_split": {
          "columns": ["text"],
          "data": [["You are just a student, do not push your opinions... Opinions are dangerous."]]
        }
      }'
```

# website

The react application exists under [fallacy-detector/Fallacy_Detector](https://github.com/lramos0/fallacy-detector/tree/main/Fallacy_Detector), for more web-devy specific details see the associated REAME there. The website was deployed on netlify, and the request to databricks is proxied by a netlify function.
