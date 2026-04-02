import json
import pandas as pd

data = pd.read_csv('database/salary.csv')
print(data.iterrows())