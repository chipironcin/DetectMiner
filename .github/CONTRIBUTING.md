# Contributing to DetectMiner

Thanks for contributing on [DetectMiner](https://github.com/chipironcin/DetectMiner). Before implementing new features and changes, feel free to [submit an issue](https://github.com/chipironcin/DetectMiner/issues/new).

Also, please check the [TODO section](https://github.com/cchipironcin/DetectMiner/blob/master/README.md#TODO) in the README file to know what is pending.

## How to submit a pull request?

1. Fork [this repository](https://github.com/chipironcin/DetectMiner/fork).
2. Create a new branch with the feature name. (Eg: improve-injected-script, add-more-filters)
3. Make your changes.
4. Commit your changes. Don't forget to add a commit title and a description.
5. Push your changes.
6. Submit your pull request.

## How to add more filters to DetectMiner

1. Open the **filters.json** file located at the root.
2. Add a new `url`(full url to public mining scripts) or `object`(suspicious objects) or `scriptName`(mining script names) or `connection`(regexp matching suspicious wss connections).
3. Save the file and create a pull request.

```json
{
  "urls": ["https://coin-hive.com/lib/coinhive.min.js", "https://coin-hive.com/lib/coinhive.js"],
  "objects": ["CoinHive", "miner"],
  "scriptNames": ["coinhive.min.js", "coinhive.js"],
  "connections": ["wss://.*.coin-hive.com[/]*?.*"]
}
```
