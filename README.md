# CORLINCEpTION converter

The live version of this converter is available [here](https://corli.huma-num.fr/convinception/#/home).
It aims at helping compatibility of corpora with [INCEpTION](https://inception-project.github.io/) by converting standard XML corpora to UIMA.
The standard help for the converter is available directly in the `help` tab of the converter; here we will detail the additional scripts.
These scripts are available in the ZIP files generated by the converter; after decompressing it, they will be at the root of the directory.
If you wish to use these scripts in another situation, please note that they target the `source` directory of the directory they're currently in.

## Checking segmentation overlaps

The `segmentation_check.py` script, which may be launched with `python segmentation_check.py` will find all the overlaps between tags, based on their UIMA offsets.
Basic information is displayed in the terminal, and a new CSV file is generated each time, containing a detailed list of all overlaps.

## Annotating with Stanza

To annotate a corpus in an INCEpTION-compatible manner, we provide the `stanza_parse.py` script.
By launching `python stanza_parse.py`, all the UIMA files will be processed with [Stanza](https://stanfordnlp.github.io/stanza) and its results are inserted into the UIMA files with INCEpTION's default layers, allowing for the different layers to appear in INCEpTION.
Once the script is finished, it generates a `inception_project_stanza.zip` that can directly be loaded into INCEpTION.

By changing the value of `lang` (line 10) based on [Stanza's available languages](https://stanfordnlp.github.io/stanza/available_models.html), you may change the target language.
By changing the value of `processors` (line 11) as explained in [Stanza's documentation](https://stanfordnlp.github.io/stanza/pipeline.html), you may change the processors it uses.

## Converting UIMA to other formats

So as to be compatible with other software, we provide three scripts to convert to other formats.

### Glozz

For the use in [Glozz](http://www.glozz.org), `uima_to_glozz.py` and `glozz_to_uima.py` allow for the conversion.
Launching `python uima_to_glozz.py` will generate `*.ac, *.aa, *.aam` files, with `<unit>` and `<relation>` tags, that can be loaded into Glozz.
Although this Glozz export may be loaded into TXM with the URS module, we recommend to use the script specially made for TXM, as shown in the next section.
Launching `python glozz_to_uima.py` does the opposite, regenerating UIMA files based on a Glozz export.

### TXM

For the use in [TXM](https://txm.gitpages.huma-num.fr/textometrie), `uima_to_tei_txm.py` allows for the conversion and `tei_txm_to_uima.py` for the reconversion.
Launching `python uima_to_tei_txm.py` will create a `TEI` directory where the script is launched and put all the files converted converted from UIMA in it.
Please note that this is possible after either launching `stanza_parse.py` or exporting from INCEpTION, as otherwise the corpus wouldn't be tokenised, and TXM won't accept it.
Each token receives all the tags it is in with `X_tag="true"` and the related attributes with `X_attr_Y="..."`.
These are then available in CQP queries; for example `[word=".*"&p_tag="true"&p_attr_speaker="Vincent"]` will give you all the words in `<p>` tags with an attribute `speaker="Vincent"`.


Launching `python tei_txm_to_uima.py` will target the `TEI` directory where the script is launched, create a `UIMA` directory and put all the converted files in it.

## Angular compiling

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.13.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
