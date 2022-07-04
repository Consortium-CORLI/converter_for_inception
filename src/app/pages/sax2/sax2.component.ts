import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxTabPanelComponent } from 'devextreme-angular';
// import { DxDataGridComponent, DxTabPanelComponent, DxProgressBarModule } from 'devextreme-angular';
import {SAXParser} from 'sax';
import { AppInfoService, Tag } from 'src/app/shared/services';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { saveAs } from 'file-saver';

// import 'ngx-highlightjs';

import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml',xml);

import * as JSZip from 'jszip';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { locale, loadMessages, formatMessage } from 'devextreme/localization';

@Component({
  selector: 'app-sax2',
  templateUrl: './sax2.component.html',
  styleUrls: ['./sax2.component.scss']
})
export class Sax2Component implements OnInit {

  @ViewChild('xmlGrid', { static: true }) xmlGrid: DxDataGridComponent;
  @ViewChild('tabPanel', { static: true }) tabPanel: DxTabPanelComponent;

  dataSource: any;
  priority: any[];
  depth: number = 0;
  fichierXML: any = undefined;

  docDataSource = [];
  docColumns = [];
  docContentMap = {};
  docTagMap = {};
  lastSelectedTag: string = undefined;
  lastSelectedAttrs: any = [];
  lastSelectedTagType: number = 0;

  parser: SAXParser;


  selectedRange: any = {};
  isSelectionStopped: any;

  /* <LOUIS> */
  tagsAverageContentLength: any = [];
  tagsChainingRatio: any = [];
  full_xml = '';
  highlighted_full_xml = '';
  first_document = 'First document';
  suggestionTickVisible = false;
  firstDocumentVisible = false;
  number_of_documents = 0;
  // auto_authentication = false;
  auto_authentication = true;
  remember_authentication = (window.localStorage.getItem('remember_authentication') === 'true')? true : false;
  // project_name = '';
  // project_name = 'project' + Date.now().toString();
  project_name = 'project' + (() => {
    var d = new Date();
    var s = d.getFullYear().toString() + '-';
    var m = d.getMonth() + 1;
    if(m < 10){
      s += '0';
    }
    s += m.toString() + '-';
    var j = d.getDate();
    if(j < 10){
      s += '0';
    }
    s += j.toString();
    return s;
  })();
  inception_id = '';
  inception_password = '';
  inception_url = '';
  uploadedXML = '';
  // history_list = JSON.parse((window.localStorage.getItem('history') || '{"history":[]}'))["history"];
  history_list = JSON.parse((window.localStorage.getItem('history') || '[]'));
  file_list = [];
  file_contents = [];
  JSONForServerRequest = '';
  conversion_progress = 0.0;
  converting = false;
  // captcha_answer = null;
  // captcha_answer = this.generate_captcha();
  captcha = this.generate_captcha();
  captcha_user_answer = undefined;
  file_to_reconvert = null;
  file_to_reconvert_name = null;
  file_to_reconvert_content = null;
  index_in_history = null;

  /*
  // LANG_dx_file_uploader_xml_files = "Charger des fichiers XML";
  LANG_dx_file_uploader_xml_files = "Charger des fichiers XML / Load XML files";
  // LANG_captcha_placeholder = "Réponse au CAPTCHA";
  LANG_captcha_placeholder = "A";
  // LANG_generate = "Générer";
  LANG_generate = "B";
  // LANG_caption_quality = "Qualité";
  LANG_caption_quality = "C";
  // LANG_caption_scale = "Echelle";
  LANG_caption_scale = "D";
  // LANG_caption_suggestions = "Suggestions";
  LANG_caption_suggestions = "E";
  // LANG_caption_choice = "Choix";
  LANG_caption_choice = "F";
  // LANG_title_converting = "Conversion";
  LANG_title_converting = "G";
  // LANG_title_tags = "Balises";
  LANG_title_tags = "H";
  // LANG_title_history = "Historique";
  LANG_title_history = "I";
  // LANG_title_help = "Aide";
  LANG_title_help = "J";
  */
  /* </LOUIS> */
  tagdefDataSource: any = [];
  tagColors: any = ["#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a"];


  taginfoPopup: any = {};

  popupSelectVisible: boolean = false;
  popupTagsVisible: boolean = true;

  /* <LOUIS> */
  suggestionPopupTagsVisible: boolean = false;
  suggestionDataSource: any = [
    {
      id:0,
      // quality: "Nécessaire",
      // quality: "{{ custom_yes }}",
      quality: "Oui",
      scale: "Document",
      // scale: "{{ custom_document }}",
      suggestions: [],
      suggestions_str: '',
      choice: ''
    },
    {
      id:1,
      // quality: "Facultatif",
      // quality: "{{ custom_no }}",
      quality: "Non",
      scale: "Paragraphe",
      // scale: "{{ custom_paragraph }}",
      suggestions: [],
      suggestions_str: '',
      choice: ''
    },
    {
      id:2,
      // quality: "Facultatif",
      // quality: "{{ custom_no }}",
      quality: "Non",
      scale: "Phrase",
      // scale: "{{ custom_sentence }}",
      suggestions: [],
      suggestions_str: '',
      choice: ''
    }
  ];
  /* </LOUIS> */

  addTagButtonComponent: any = undefined;

  pythonCode: string = "";

  tagTypes: any = [
    { value: 0, label: "doc", class: "document", color: "#ff9999" },
    { value: 1, label: "paragraph", class: "paragraph", color: "#99b3ff" },
    { value: 2, label: "phrase", class: "sentence", color: "#85e085" },
    { value: 3, label: "annotation", class: "webanno.custom.", color: undefined },
    { value: 4, label: "IGNORER", class: undefined, color: "gray" },
    { value: 4, label: "Extérieur", class: undefined, color: "gray" },
  ];

  constraintTypes: any = [
    { label: "none", value: "document" },
    { label: "relative level==1", value: "1" },
  ];

  typesystemTemplate: string = undefined;
  typesystem: string = "<xml></xml>";


  editorOptions = { theme: 'vs-dark', language: 'text/plain' };


  constructor(public appInfo: AppInfoService) {

    // this.typesystemTemplate  =  appInfo.getTypesystemTemplate();
    appInfo.getTypesystemTemplate().then(r => {
      this.typesystemTemplate = r;
    });







    loadMessages({
      'fr': {
        "test": "test français",
        "custom_yes": "Oui",
        "custom_no": "Non",
        "custom_generate": "GENERER",
        "custom_load_xml_files": "Charger des fichiers XML",
        "custom_conversion": "Conversion",
        "custom_tags": "Balises",
        "custom_history_and_converting_back": "Historique et reconversion",
        "custom_help": "Aide",
        "custom_quality": "Qualité",
        "custom_necessary": "Nécessaire",
        "custom_scale": "Echelle",
        "custom_suggestions": "Suggestions",
        "custom_choice": "Choix",
        "custom_first_document_out_of": "Premier document (sur",
        "custom_tag": "Balise",
        "custom_attributes": "Attributs",
        "custom_constraint": "Contrainte",
        "custom_type": "Type",
        "custom_quantity": "Quantité",
        "custom_average_length": "Longueur moyenne",
        "custom_index": "Indice",
        "custom_project_name": "Nom du projet ",
        "custom_document_separator": "Séparateur de documents",
        "custom_date": "Date",
        "custom_file_names": "Noms des fichiers",
        "custom_reconvert_to_initial_format" : "Reconversion vers le format initial d'un export INCEpTION (pour ce faire, faites un export avec comme format additionnel UIMA CAS XML 1.1, déposez le fichier ZIP ci-dessous et indiquez le numéro de la conversion initiale qui se trouve dans l'historique) : ",
        "custom_load_an_inception_file": "Charger un fichier d'export INCEpTION",
        "custom_index_in_history": "Indice dans l'historique",
        "custom_reconvert": "Reconvertir",
        "custom_load_your_documents": "Chargez vos documents",
        "custom_click_on_pen": "Cliquez sur le crayon pour modifier la balise séparatrice de documents",
        "custom_fill_document_separator": "Renseignez la balise séparatrice et cliquez sur \"Sauvegarder\"",
        "custom_fill_captcha": "Remplissez le CAPTCHA",
        "custom_modify_project_name": "Modifiez le nom du projet si vous le souhaitez, cliquez sur \"GENERER\" et patientez jusqu'à ce que votre corpus converti soit téléchargé automatiquement",
        "custom_inception_import": "Une fois dans INCEpTION, dans l'onglet \"Projects\", importez le fichier téléchargé en cliquant sur \"Import project\"",
        "custom_automated_import": "Import automatique",
        "custom_manual_import": "Import manuel",
        "custom_help_settings": "Dans le projet en question, cliquez sur \"Settings\"",
        "custom_help_layers": "Cliquez sur \"Layers\"",
        "custom_help_import_typesystem": "Après avoir décompressé l'archive ZIP, cliquez sur \"Import\" et sélectionnez le fichier typesystem.xml ; cela indique à INCEpTION les différentes couches d'annotation",
        "custom_help_documents": "Cliquez ensuite sur \"Documents\"",
        "custom_help_import_documents": "Sélectionnez les fichiers contenus dans le répertoire \"source\", indiquez qu'il s'agit du format UIMA CAS XML 1.1 et cliquez sur \"Import\"",
        "custom_help_dashboard": "Pour vérifier que tout a bien été importé, cliquez sur \"Dashboard\"",
        "custom_help_annotation": "Puis cliquez sur \"Annotation\"",
        "custom_help_result": "Et en sélectionnant un des fichiers, vous pourrez voir si toutes les couches sont bien présentes",
        "custom_advanced_tools": "Outils avancés",
        "custom_advanced_users_note": "Pour les utilisateurs avancés qui souhaitent aller plus loin, nous proposons des scripts Python supplémentaires",
        "custom_segmentation_check": "Le script segmentation_check.py permet de voir si certaines balises sont à cheval ; en plus du résultat dans le terminal, cela génère un fichier CSV contenant tous les résultats.",
        "custom_uima_to_glozz": "Le script uima_to_glozz.py permet de convertir les fichiers UIMA vers le format Glozz (*.ac, *.aa, *.aam) pour une possibilité d'exploration dans d'autres logiciels, comme notamment Glozz ou encore TXM avec le module URS.",
        "custom_glozz_to_uima": "Le script glozz_to_uima.py permet de reconvertir un export Glozz vers de l'UIMA.",
        "custom_stanza_parse_part_one": "Le script stanza_parse.py permet de faire une annotation du corpus pour une variété de couches en utilisant ",
        "custom_stanza_parse_part_two": " ; cela vous génère un fichier ZIP qu'il est possible de charger automatiquement (cf. Import automatique) ou manuellement (cf. Import manuel) dans INCEpTION. À noter qu'en haut du fichier stanza_parse.py vous pouvez paramétrer la langue que vous souhaitez.",
        "custom_a_single_corpus": "fusionner les annotations des annotateurs en un seul corpus",
        "custom_one_corpus_per_annotator": "une version du corpus pour chaque annotateur",
        "custom_converting_example": "Exemple de conversion",
        "custom_example_consider_this_corpus_file": "Considérons ce fichier de corpus : chaque texte qui nous intéresse est contenu dans un <div> ... </div>",
        "custom_example_select_div": "En sélectionnant \"div\" (sans guillemets) comme séparateur de documents, l'outil crée un fichier unique pour chaque :",
        "custom_example_it_then_converts_to_UIMA": "Il convertit ensuite chaque fichier vers de l'UIMA (et les place tous dans un ZIP chargeable directement dans INCEpTION) :",
        "custom_your_corpus_will_be_split": "Votre corpus sera séparé en unités textuelles. Veuillez sélectionner le séparateur de documents (un exemple du processus est disponible dans l'onglet \"Exemple de conversion\") :",
        "dxDataGrid-noDataText": "Pas de données",
        "dxDataGrid-editingSaveRowChanges": "Sauvegarder",
        "dxDataGrid-editingCancelRowChanges": "Annuler"
      },
      'en': {
        "test": "test english",
        "custom_yes": "Yes",
        "custom_no": "No",
        "custom_generate": "GENERATE",
        "custom_load_xml_files": "Load XML files",
        "custom_conversion": "Converting",
        "custom_tags": "Tags",
        "custom_history_and_converting_back": "History and converting back",
        "custom_help": "Help",
        "custom_quality": "Quality",
        "custom_necessary": "Necessary",
        "custom_scale": "Scale",
        "custom_suggestions": "Suggestions",
        "custom_choice": "Choice",
        "custom_first_document_out_of": "First document (out of",
        "custom_tag": "Tag",
        "custom_attributes": "Attributes",
        "custom_constraint": "Constraint",
        "custom_type": "Type",
        "custom_quantity": "Quantity",
        "custom_average_length": "Average length",
        "custom_index": "Index",
        "custom_project_name": "Project name",
        "custom_document_separator": "Document separator",
        "custom_date": "Date",
        "custom_file_names": "File names",
        "custom_reconvert_to_initial_format" : "Converting back to the initial format from an INCEpTION export (to do so, export with UIMA CAS XML 1.1 as an additional format, put the ZIP file just below and indicate the index of the initial converting that may be found in the history): ",
        "custom_load_an_inception_file": "Load an INCEpTION export file",
        "custom_index_in_history": "Index in history",
        "custom_reconvert": "Convert back",
        "custom_load_your_documents": "Load your documents",
        "custom_click_on_pen": "Click on the pen to modify the document-separating tag",
        "custom_fill_document_separator": "Fill in the document-separating tag and click on \"Save\"",
        "custom_fill_captcha": "Fill in the CAPTCHA",
        "custom_modify_project_name": "Modify the project name if you wish to, click on \"Generate\" and wait until your converted corpus is downloaded automatically",
        "custom_inception_import": "Once in INCEpTION, in the \"Projects\" tab, import the downloaded file by clicking on \"Import project\"",
        "custom_automated_import": "Automated import",
        "custom_manual_import": "Manual import",
        "custom_help_settings": "In the target project, click on \"Settings\"",
        "custom_help_layers": "Click on \"Layers\"",
        "custom_help_import_typesystem": "After decompressing the ZIP archive, click on \"Import\" and select the typesystem.xml file; this will tell INCEpTION the different annotation layers",
        "custom_help_documents": "Then click on \"Documents\"",
        "custom_help_import_documents": "Select the files from the \"source\" directory, indicate it is the UIMA CAS XML 1.1 format and click on \"Import\"",
        "custom_help_dashboard": "To verify that everything has been imported correctly, click on \"Dashboard\"",
        "custom_help_annotation": "Then click on \"Annotation\"",
        "custom_help_result": "And by selecting one of the files, you can see if all the layers are here",
        "custom_advanced_tools": "Advanced tools",
        "custom_advanced_users_note": "For advanced users that wish to go further, we make available additional Python scripts",
        "custom_segmentation_check": "The segmentation_check.py script allows to see if some tags overlap; beyond the results in the terminal, it generates a CSV file containing all the results.",
        "custom_uima_to_glozz": "The uima_to_glozz.py script allows to convert from UIMA format to Glozz format (*.ac, *.aa, *.aam) so as to be compatible with other software, such as Glozz or TXM with the URS module.",
        "custom_glozz_to_uima": "The glozz_to_uima.py script allows to convert back from Glozz format to UIMA format.",
        "custom_stanza_parse_part_one": "The stanza_parse.py script allows to annotate the corpus for a variety of layers by using ",
        "custom_stanza_parse_part_two": "; it generates a ZIP file that can be loaded automatically (cf. Automated import) or manually (cf. Manual import) into INCEpTION. Please note that at the top of the stanza_parse.py file you may change the target language.",
        "custom_a_single_corpus": "merge the annotations of annotators into a single corpus",
        "custom_one_corpus_per_annotator": "one version of the corpus for each annotator",
        "custom_converting_example": "Converting example",
        "custom_example_consider_this_corpus_file": "Let's consider this corpus file: each text is contained within a <div> ... </div>",
        "custom_example_select_div": "By selecting \"div\" (without quotes) as a document separator, the tool creates a unique file for each:",
        "custom_example_it_then_converts_to_UIMA": "It then converts each file to UIMA (and places them into a ZIP that can directly be loaded into INCEpTION):",
        "custom_your_corpus_will_be_split": "Your corpus will be split in textual units. Please select the document separator (an example of the process is avaiable in the \"Converting example\" tab):",
        "dxDataGrid-noDataText": "No data",
        "dxDataGrid-editingSaveRowChanges": "Save",
        "dxDataGrid-editingCancelRowChanges": "Cancel"
      }
    });

    locale(navigator.language);

  }

  get custom_yes(){return formatMessage("custom_yes")}
  get custom_no(){return formatMessage("custom_no")}
  get custom_generate(){return formatMessage("custom_generate")}
  get custom_load_xml_files(){return formatMessage("custom_load_xml_files")}
  get custom_conversion(){return formatMessage("custom_conversion")}
  get custom_tags(){return formatMessage("custom_tags")}
  get custom_history_and_converting_back(){return formatMessage("custom_history_and_converting_back")}
  get custom_help(){return formatMessage("custom_help")}
  get custom_quality(){return formatMessage("custom_quality")}
  get custom_necessary(){return formatMessage("custom_necessary")}
  get custom_scale(){return formatMessage("custom_scale")}
  get custom_suggestions(){return formatMessage("custom_suggestions")}
  get custom_choice(){return formatMessage("custom_choice")}
  get custom_first_document_out_of(){return formatMessage("custom_first_document_out_of")}
  get custom_tag(){return formatMessage("custom_tag")}
  get custom_attributes(){return formatMessage("custom_attributes")}
  get custom_constraint(){return formatMessage("custom_constraint")}
  get custom_type(){return formatMessage("custom_type")}
  get custom_quantity(){return formatMessage("custom_quantity")}
  get custom_average_length(){return formatMessage("custom_average_length")}
  get custom_index(){return formatMessage("custom_index")}
  get custom_project_name(){return formatMessage("custom_project_name")}
  get custom_document_separator(){return formatMessage("custom_document_separator")}
  get custom_date(){return formatMessage("custom_date")}
  get custom_file_names(){return formatMessage("custom_file_names")}
  get custom_reconvert_to_initial_format(){return formatMessage("custom_reconvert_to_initial_format")}
  get custom_load_an_inception_file(){return formatMessage("custom_load_an_inception_file")}
  get custom_index_in_history(){return formatMessage("custom_index_in_history")}
  get custom_reconvert(){return formatMessage("custom_reconvert")}
  get custom_load_your_documents(){return formatMessage("custom_load_your_documents")}
  get custom_click_on_pen(){return formatMessage("custom_click_on_pen")}
  get custom_fill_document_separator(){return formatMessage("custom_fill_document_separator")}
  get custom_fill_captcha(){return formatMessage("custom_fill_captcha")}
  get custom_modify_project_name(){return formatMessage("custom_modify_project_name")}
  get custom_inception_import(){return formatMessage("custom_inception_import")}
  get custom_automated_import(){return formatMessage("custom_automated_import")}
  get custom_manual_import(){return formatMessage("custom_manual_import")}
  get custom_help_settings(){return formatMessage("custom_help_settings")}
  get custom_help_layers(){return formatMessage("custom_help_layers")}
  get custom_help_import_typesystem(){return formatMessage("custom_help_import_typesystem")}
  get custom_help_documents(){return formatMessage("custom_help_documents")}
  get custom_help_import_documents(){return formatMessage("custom_help_import_documents")}
  get custom_help_dashboard(){return formatMessage("custom_help_dashboard")}
  get custom_help_annotation(){return formatMessage("custom_help_annotation")}
  get custom_help_result(){return formatMessage("custom_help_result")}
  get custom_advanced_tools(){return formatMessage("custom_advanced_tools")}
  get custom_advanced_users_note(){return formatMessage("custom_advanced_users_note")}
  get custom_segmentation_check(){return formatMessage("custom_segmentation_check")}
  get custom_uima_to_glozz(){return formatMessage("custom_uima_to_glozz")}
  get custom_glozz_to_uima(){return formatMessage("custom_glozz_to_uima")}
  get custom_stanza_parse_part_one(){return formatMessage("custom_stanza_parse_part_one")}
  get custom_stanza_parse_part_two(){return formatMessage("custom_stanza_parse_part_two")}
  get custom_a_single_corpus(){return formatMessage("custom_a_single_corpus")};
  get custom_one_corpus_per_annotator(){return formatMessage("custom_one_corpus_per_annotator")};
  get custom_converting_example(){return formatMessage("custom_converting_example")};
  get custom_example_consider_this_corpus_file(){return formatMessage("custom_example_consider_this_corpus_file")};
  get custom_example_select_div(){return formatMessage("custom_example_select_div")};
  get custom_example_it_then_converts_to_UIMA(){return formatMessage("custom_example_it_then_converts_to_UIMA")};
  get custom_your_corpus_will_be_split(){return formatMessage("custom_your_corpus_will_be_split")};
  // get custom_load_xml_files(){return formatMessage("custom_load_xml_files")}
  // get custom_load_xml_files(){return formatMessage("custom_load_xml_files")}
  // get custom_load_xml_files(){return formatMessage("custom_load_xml_files")}
  // get custom_load_xml_files(){return formatMessage("custom_load_xml_files")}
  // get custom_load_xml_files(){return formatMessage("custom_load_xml_files")}
  // "custom_conversion": "Conversion",
  // "custom_tags": "Balises",
  // "custom_history": "Historique",
  // "custom_help": "Aide",
  // "custom_tag": "Balise",
  // "custom_attributes": "Attributs",
  // "custom_constraint": "Contrainte",
  // "custom_type": "Type",
  // "custom_quantity": "Quantité",
  // "custom_average_length": "Longueur moyenne",
  // "custom_index": "Indice",
  // "custom_project_name": "Nom du projet",
  // "custom_document_separator": "Séparateur de document",
  // "custom_date": "Date",
  // "custom_file_names": "Noms des fichiers",
  // "custom_load_your_documents": "Chargez vos documents",
  // "custom_click_on_pen": "Cliquez sur le crayon pour modifier la balise séparatrice de documents",
  // "custom_fill_document_separator": "Renseignez la balise séparatrice et cliquez sur \"Sauvegarder\"",
  // "custom_fill_captcha": "Remplissez le CAPTCHA",
  // "custom_modify_project_name": "Modifiez le nom du projet si vous le souhaitez, cliquez sur \"GENERER\" et patientez jusqu'à ce que votre corpus converti soit téléchargé automatiquement",
  // "custom_inception_import": "Une fois dans INCEpTION, dans l'onglet \"Projects\", importez le fichier téléchargé en cliquant sur \"Import project\"",
  // "dxDataGrid-noDataText": "Pas de données",
  // "dxDataGrid-editingSaveRowChanges": "Sauvegarder"

  generate_captcha(){
    // var element_a = ~~(Math.random() * 20) - 10;
    // var element_b = ~~(Math.random() * 20) - 10;
    // var element_c = ~~(Math.random() * 20) - 10;
    var element_a = ~~(Math.random() * 10);
    var element_b = ~~(Math.random() * 10);
    var element_c = ~~(Math.random() * 10);
    // console.log(element_a, element_b, element_c);
    
    var sign_a = ~~(Math.random() * 3);
    var sign_b = ~~(Math.random() * 2);

    var s = '';
    s += element_a.toString();
    s += ' ';

    var total = 0;
    if(sign_a === 0){
      total += (element_a + element_b);
      s += '+ ';
    }else if(sign_a === 1){
      total += (element_a - element_b);
      s += '- ';
    }else{
      total += (element_a * element_b);
      s += '* ';
    }
    // console.log('A', total);

    s += element_b.toString();
    s += ' ';

    if(sign_b === 0){
      total += (element_c);
      s += '+ ';
    }else if(sign_b === 1){
      total += (-element_c);
      s += '- ';
    }
    // console.log('B', total);

    s +=  element_c.toString() + ' =';

    // this.captcha_answer = total;
    // console.log('C', total, this.captcha_answer);

    // return total;
    return {
      equation: s,
      answer: total
    }
  }

  display_captcha(){
    // var canvas = document.getElementById('captcha_canvas');
    var canvas = document.getElementsByTagName('canvas')[0];
    var context = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var color = '#';
    var text_color = '#';
    for(var i = 0 ; i < 6 ; i++){
      color += 'abcdef'[~~(Math.random()*6)];
      text_color += '012345'[~~(Math.random()*6)];
    }
    // var angle = (Math.random() * 20) - 10;
    // var angle = (Math.random() * 4) - 2;
    // var angle = (Math.random() * 0.4) - 0.2;
    var angle = (Math.random() * 0.3) - 0.15;
    // var angle = 0;
    context.fillStyle = color;
    // context.fillRect(0,0,width,height);
    context.fillRect(0,0,width,height);
    context.save();
    context.rotate(angle);
    context.strokeStyle = text_color;
    context.font = (~~(Math.random()*5) + 15).toString() +  'px verdana';
    // context.strokeText(s,~~(width/2),~~(height/2));
    var x_offset = (Math.random() * 0.05) + 0.025;
    // context.strokeText(s,~~(width*x_offset),~~(height/2));
    context.strokeText(this.captcha['equation'],~~(width*x_offset),~~(height/2));
    context.restore();
    // context.restore();
    var nb_lines = 5;
    for(var i = 0 ; i < nb_lines ; i++){
      var color = '#';
      for(var j = 0 ; j < 6 ; j++){
        color += '0123456789abcdef'[~~(Math.random()*16)];
      }
      context.strokeStyle = color;
      var x1 = Math.random() * 0.2;
      var x2 = Math.random() * 0.2 + 0.8;
      var y1 = Math.random();
      var y2 = Math.random();
      // context.stroke(x1,y1,x2,y2);
      context.beginPath();
      context.moveTo(x1*width,y1*height);
      context.lineTo(x2*width,y2*height);
      context.closePath();
      context.stroke();
    }
  }



  customizeColumns(columns) {
    // columns[0].width = 70;
  }



  onFileUploaderValueChanged(event) {
    // console.log("onFileUploaderValueChanged, event=", event); 
    // console.log(event.value);
    
    /*
    if (event.value && event.value[0]) {

      let file = event.value[0];

      if (!file) {
        alert("Fichier requis");
        event.cancel = true;
        return;
      }
      this.fichierXML = file.name;
      this.uploadedXML = file;
      if(!(file.name.endsWith('.xml'))){
        console.error("Nom de fichier invalide.");
        alert("Nom de fichier invalide");
        return;
      }
      let reader = new FileReader();
      this.depth = 0;
      reader.onload = () => {
        this.initParser();
        this.parser.write(reader.result).close();
        
        
        this.collectTags();
        // document.getElementById('xml_display_iframe').src = file.name;
        // var tab_panel = document.getElementById('main_tab_panel');
        // var dxi_item = document.createElement('dxi-item');
        // dxi_item.title = 'Fichier XML';

        // this.highlighted_full_xml = hljs.highlight(this.full_xml,{language:'xml'}).value;
        // document.getElementById('xml_p').innerHTML = this.highlighted_full_xml; // ICI



        this.suggestionTickVisible = true;
        this.suggestionPopupTagsVisible = true;
        for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
          if(this.tagdefDataSource[i]['type'] === 0){
            this.suggestionDataSource[0].choice = this.tagdefDataSource[i]['tag'];
            break;
          }
        } 
        this.updateSystem();
      }

      reader.readAsText(file);
    }
    */
    
    /*
    if(event.value){
      for(var i = 0, i_limit = event.value.length ; i < i_limit ; i++){
        let file = event.value[i];
        if(!(file.name.endsWith('.xml'))){
          let local_string = "Nom de fichier invalide : " + file.name;
          console.error(local_string);
          alert(local_string);
          continue;
        }
        if(!(this.fichierXML)){
          this.fichierXML = file.name;
          this.uploadedXML = file;
        }


        let reader = new FileReader();
        this.depth = 0;
        reader.onload = () => {
          this.initParser();
          this.parser.write(reader.result).close();
          
          
          this.collectTags();
          // document.getElementById('xml_display_iframe').src = file.name;
          // var tab_panel = document.getElementById('main_tab_panel');
          // var dxi_item = document.createElement('dxi-item');
          // dxi_item.title = 'Fichier XML';

          // this.highlighted_full_xml = hljs.highlight(this.full_xml,{language:'xml'}).value;
          // document.getElementById('xml_p').innerHTML = this.highlighted_full_xml; // ICI



          this.suggestionTickVisible = true;
          this.suggestionPopupTagsVisible = true;
          for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
            if(this.tagdefDataSource[i]['type'] === 0){
              this.suggestionDataSource[0].choice = this.tagdefDataSource[i]['tag'];
              break;
            }
          } 
          this.updateSystem();


          this.file_list.push(file); // ?
        }

        reader.readAsText(file);
      }
      // console.log(this.file_list);
    }
    */




    if (event.value && event.value[0]) {

      let file = event.value[0];

      if (!file) {
        alert("Fichier requis");
        event.cancel = true;
        return;
      }
      this.fichierXML = file.name;
      this.uploadedXML = file;
      if(!(file.name.endsWith('.xml'))){
        console.error("Nom de fichier invalide.");
        alert("Nom de fichier invalide");
        return;
      }
      let reader = new FileReader();
      this.depth = 0;
      reader.onload = () => {
        this.initParser();
        this.parser.write(reader.result).close();
        
        
        this.collectTags();
        // document.getElementById('xml_display_iframe').src = file.name;
        // var tab_panel = document.getElementById('main_tab_panel');
        // var dxi_item = document.createElement('dxi-item');
        // dxi_item.title = 'Fichier XML';

        // this.highlighted_full_xml = hljs.highlight(this.full_xml,{language:'xml'}).value;
        // document.getElementById('xml_p').innerHTML = this.highlighted_full_xml; // ICI



        this.suggestionTickVisible = true;
        this.suggestionPopupTagsVisible = true;
        for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
          if(this.tagdefDataSource[i]['type'] === 0){
            this.suggestionDataSource[0].choice = this.tagdefDataSource[i]['tag'];
            break;
          }
        } 
        this.updateSystem();




        this.file_list[0]["content"] = reader.result;
        this.file_contents[0] = reader.result;
      }

      reader.readAsText(file);
      // var readers_list = [reader];
      // reader.readAsText(file);

      /****************************/

      this.file_list.push(file);
      var zis = this;
      for(var i = 1, i_limit = event.value.length ; i < i_limit ; i++){
        let file = event.value[i];
        if(!(file.name.endsWith('.xml'))){
          let local_string = "Nom de fichier invalide : " + file.name;
          console.error(local_string);
          alert(local_string);
          continue;
        }

        let reader = new FileReader();
        // readers_list.push(new FileReader());
        this.depth = 0;
        var local_index = i + 0;
        
        reader.onload = () => {
          // this.initParser();
          // this.parser.write(reader.result).close();
          
          // this.collectTags();

          // this.file_list.push(file); // ?

          // this.file_list[local_index]["content"] = reader.result;
          // console.log(zis);
          for(var j = 0, j_limit = zis.file_list.length ; j < j_limit ; j++){
            if(zis.file_list[j].name === file.name){
              local_index = j;
              // console.log('local_index found:',local_index);
              break;
            }
          }
          zis.file_list[local_index]["content"] = reader.result;
          zis.file_contents[local_index] = reader.result;
        }
        
       /*
        readers_list[readers_list.length-1].onload = () => {
          console.log(zis);
          zis.file_list[local_index]["content"] = reader.result;
          zis.file_contents[local_index] = reader.result;
        }
        */

        this.file_list.push(file);

        reader.readAsText(file);
        // readers_list[readers_list.length-1].readAsText(file);
      }
    }
    // this.generate_captcha();
    // setTimeout(this.generate_captcha,100);
    setTimeout(() => {
      this.captcha = this.generate_captcha();
      this.display_captcha();
    },100);

    var suggestion_div = document.getElementById('suggestion_div');
    suggestion_div.style.display = 'block';
  }

  
  onReconverterFileUploaderValueChanged(event) {
    




    if (event.value && event.value[0]) {

      let file = event.value[0];

      if (!file) {
        alert("Fichier requis");
        event.cancel = true;
        return;
      }
      this.file_to_reconvert_name = file.name;
      // document.getElementById('reconverter_filename_p').innerText = this.file_to_reconvert_name;
      document.getElementById('div_reconv_details').style.display = 'block';
      this.file_to_reconvert = file;
      if(!(file.name.endsWith('.zip'))){
        console.error("Nom de fichier invalide.");
        alert("Nom de fichier invalide");
        return;
      }
      let reader = new FileReader();
      this.depth = 0;
      reader.onload = () => {
        this.file_to_reconvert_content = reader.result;
        console.log(this.file_to_reconvert);
        console.log(this.file_to_reconvert_name);
        console.log(this.file_to_reconvert_content);
      }

      // reader.readAsText(file);
      reader.readAsBinaryString(file);
      // var readers_list = [reader];
      // reader.readAsText(file);

      /****************************/

    }
  }

  ngOnInit() {

  }


  initParser() {
    let zis = this;
    var contenu = "";
    this.docColumns = ["id"];

    var rowid = 0;
    zis.docDataSource = [];

    this.parser = new SAXParser(true);

    /* <LOUIS> */
    // var tagsAverageContentLength = [];
    var charIndex = 0;
    var endedElement = '';
    zis.full_xml = '';
    /* </LOUIS> */

    this.parser.onerror = function (e) {
      console.log("<ERROR>" + rowid + " " + JSON.stringify(e) + "</ERROR>");
        alert("<ERROR>" + rowid + " " + JSON.stringify(e) + "</ERROR>");
    };
    this.parser.ontext = function (t) {
      // got some text.  t is the string of text.
      contenu = t;
      /* <LOUIS> */
      // charIndex += chars.length;
      charIndex += t.length;
      zis.full_xml += t;
      /* </LOUIS> */
    };
    this.parser.onopentag = function (node) {
      // opened a tag.  node has "name" and "attributes"
      //  console.log("=> Started: " , node ); // +      "  (Attributes: "+   zis.attrToString(node.attributes)+" )" );

       /* <LOUIS> */
        // if(!(elem in tagsAverageContentLength)){
          // if(!(elem in zis.tagsAverageContentLength)){
          if(!(node.name in zis.tagsAverageContentLength)){
            // tagsAverageContentLength[elem] = {
              // zis.tagsAverageContentLength[elem] = {
              zis.tagsAverageContentLength[node.name] = {
              sum: 0,
              count: 0,
              average: undefined
            };
          }
          // tagsAverageContentLength[elem].sum -= charIndex;
          // zis.tagsAverageContentLength[elem].sum -= charIndex;
          zis.tagsAverageContentLength[node.name].sum -= charIndex;
          // console.log('NEG', charIndex);
  
  
  
  
          if(!(endedElement in zis.tagsChainingRatio)){
            zis.tagsChainingRatio[endedElement] = {
              count: 0,
              total_count: 0,
              // radio: undefined
              ratio: 0
            };
          }
          // if(elem === endedElement){
          if(node.name === endedElement){
            zis.tagsChainingRatio[endedElement].count++;
          }
          zis.tagsChainingRatio[endedElement].total_count++;
          // zis.tagsChainingRatio[endedElement].ratio = zis.tagsChainingRatio[endedElement].count / zis.tagsChainingRatio[endedElement].total_count;
          zis.tagsChainingRatio[endedElement].ratio = ~~((zis.tagsChainingRatio[endedElement].count / zis.tagsChainingRatio[endedElement].total_count)*1000)/1000;
          // zis.tagsChainingRatio[endedElement].ratio = (~~((zis.tagsChainingRatio[endedElement].count / zis.tagsChainingRatio[endedElement].total_count)*1000)/10).toString() + '%';
          /* </LOUIS> */

      rowid++;
      //console.log(rowid + " <elem>=" + elem);
      var row: any = {}
      var cname = "P" + zis.depth;
      // console.log('ATTRS:',node.attributes); // -> HERE IT'S OK
      row.attrsstr = zis.attrToString(node.attributes);
      // if(Math.random() < 0.3){console.log('ATTRS:',row.attrsstr);}
      // if(node.attributes != {}){console.log('ATTRS:',node.attributes,row.attrsstr);} // HERE IT ISN'T OK
      if (node.attributes.length == 0)
        row[cname] = "<" + node.name + ">";
      else
        row[cname] = "<" + node.name + " " + row.attrsstr + ">";
      row.id = rowid;
      row.elem = node.name;
      row.attrs = node.attributes;
      for (var i = 1; i < zis.depth; i++) {
        row["P" + i] = "";
      }
      zis.docDataSource.push(row);

      if (zis.docColumns.indexOf(cname) == -1) {
        zis.docColumns.push(cname);
      }

      zis.depth = zis.depth + 1;


      /* <LOUIS> */
      zis.full_xml += '<' + node.name + '>';
      /* </LOUIS> */
    };
    this.parser.onattribute = function (attr) {
      // an attribute.  attr has "name" and "value"
    };
    this.parser.onclosetag = function (name) {
      // parser stream is done, and ready to have more stuff written to it.

          //  console.log("<= End: " , name );

           /* <LOUIS> */
        // tagsAverageContentLength[elem].sum += charIndex;
        // tagsAverageContentLength[elem].count++;
        // tagsAverageContentLength[elem].average = ~~(tagsAverageContentLength[elem].sum / tagsAverageContentLength[elem].count);
        
        // this.tagsAverageContentLength[elem].sum += charIndex;
        // this.tagsAverageContentLength[elem].count++;
        // this.tagsAverageContentLength[elem].average = ~~(this.tagsAverageContentLength[elem].sum / this.tagsAverageContentLength[elem].count);

        // zis.tagsAverageContentLength[elem].sum += charIndex;
        zis.tagsAverageContentLength[name].sum += charIndex;
        // console.log('POS', charIndex);
        // zis.tagsAverageContentLength[elem].count++;
        zis.tagsAverageContentLength[name].count++;
        // zis.tagsAverageContentLength[elem].average = ~~(zis.tagsAverageContentLength[elem].sum / zis.tagsAverageContentLength[elem].count);
        zis.tagsAverageContentLength[name].average = ~~(zis.tagsAverageContentLength[name].sum / zis.tagsAverageContentLength[name].count);

        // endedElement = elem;
        endedElement = name;
        /* </LOUIS> */

          rowid++;
          zis.depth = zis.depth - 1;
  
          var row: any = {}
          row["P" + zis.depth] = "</" + name + ">";
          row.id = rowid;
          row.elem = name;
          for (var i = 1; i < zis.depth; i++) {
            row["P" + i] = "";
          }
          zis.docDataSource.push(row);
          var previous = rowid > 1 ? zis.docDataSource[rowid - 2] : "";
  
          zis.docContentMap[rowid] = contenu;
          var previoustag = previous["P" + zis.depth];
          if (previous && previoustag && previoustag.substring(0, name.length + 1) == "<" + name) {
            zis.docContentMap[rowid - 1] = contenu;
          }
      
          /* <LOUIS> */
          zis.full_xml += '</' + name + '>';
          /* </LOUIS> */
    };

    // console.log(contenu);
    // console.log(this.full_xml);
  }



  onContentReady(e) {
 
  }


  onCellClick(e) {
    // Afficher les contenu de la cellule dans la popup
    //    console.log(e);
    if (e.data[e.column.dataField] && e.data[e.column.dataField][0] == "<")
      this.taginfoPopup.tag = "Tag : " + e.data[e.column.dataField];
    else
      this.taginfoPopup.tag = "";

    this.taginfoPopup.contenu = this.docContentMap[e.data.id];


  }

  onCellHoverChanged(e) {

  }

  onCellPrepared(e) {
    if (e.rowType === "data" /*&& e.column.dataField === "field"*/) {
      if (e.data.elem in this.docTagMap) {
        let data = this.docTagMap[e.data.elem];
        e.cellElement.style.background = data;
      }
    }
  }

  onToolbarPreparingSuggestionPopup(e) {
    var toolbarItems = e.toolbarOptions.items;

    /*
    toolbarItems.push({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        type: 'normal',
        hint: 'Mettre à jour le type des balises',
        text: 'Mettre à jour toutes les balises',
        disabled: false,
        onInitialized: (e) => {
          // this.popupTagsVisible = false;
        },
        onClick: () => {
          // if(!this.tagdefDataSource || this.tagdefDataSource.length<1)
          // alert("Il faut d'abord chager un fichier");
          // else
          // this.collectTags();
          console.log("Bouton 'mise à jour'");
          // var button = document.getElementById('suggestionBox');
          // console.log(button);
          // button.style.display = 'block';
          // this.popupTagsVisible = true;
          // this.suggestionPopupTagsVisible = true;

          for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
            // if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[0].choice && this.tagdefDataSource[i].type === 0){
            //   this.tagdefDataSource[i].type = 3;
            // }else if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[1].choice && this.tagdefDataSource[i].type === 1){
            //   this.tagdefDataSource[i].type = 3;
            // }else if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[2].choice && this.tagdefDataSource[i].type === 2){
            //   this.tagdefDataSource[i].type = 3;
            // }

            // if(this.tagdefDataSource[i].tag === this.suggestionDataSource[0].choice){
            //   if(this.tagdefDataSource[i].type === 0)
            //   this.tagdefDataSource[i].type = 3;
            // }

            if(this.tagdefDataSource[i].tag === this.suggestionDataSource[0].choice){
              this.tagdefDataSource[i].type = 0; 
            }else if(this.tagdefDataSource[i].tag === this.suggestionDataSource[1].choice){
              this.tagdefDataSource[i].type = 1; 
            }else if(this.tagdefDataSource[i].tag === this.suggestionDataSource[2].choice){
              this.tagdefDataSource[i].type = 2; 
            }else{
              this.tagdefDataSource[i].type = 3;
            }
          }
        }
      }
    }
    );
    */
  }

  generer(){
    /* <LOUIS> */
    /*
    if(!(this.inception_url.startsWith('http'))){
      this.inception_url = 'http://' + this.inception_url;
    }
    */
    // console.log(this.captcha_user_answer,Number(this.captcha_user_answer),this.captcha_answer);
  //  if(Number(this.captcha_user_answer) !== this.captcha_answer){
    if(Number(this.captcha_user_answer) !== this.captcha['answer']){
    //  console.log(this.captcha_user_answer,Number(this.captcha_user_answer),this.captcha_answer);
     alert('CAPTCHA incorrect.');
    //  this.generate_captcha();
    this.captcha = this.generate_captcha();
    this.display_captcha();
     return;
   }
   this.converting = true;
    /* </LOUIS> */
    this.typesystemGeneration();
    // this.generatePythonParser();

    // this.downloadZip();
    /* <LOUIS> */
    this.generateJSONForServerRequest();
    this.queryServerWithJSON();
    /* </LOUIS> */

    /*
    this.tabPanel.selectedIndex=1;
    this.popupTagsVisible = false;
    this.popupSelectVisible = false;
    this.suggestionPopupTagsVisible = false;
    */

    /* <LOUIS> */
    /*
    if(this.remember_authentication){
      window.localStorage.setItem('id',this.inception_id);
      window.localStorage.setItem('password',this.inception_password);
      window.localStorage.setItem('inception_url',this.inception_url);
    }else{
      window.localStorage.removeItem('id');
      window.localStorage.removeItem('password');
      window.localStorage.removeItem('inception_url');
    }
    window.localStorage.setItem('remember_authentication',this.remember_authentication.toString());
    */

    this.history_list.push({
      "id": this.history_list.length,
      "date": (new Date()).toString(),
      // "project_name": (this.project_name.length > 0)? this.project_name : '(aucun)',
      "project_name": this.project_name,
      // "file_name": this.fichierXML,
      // "file_name": this.file_list.toString(),
      /*
      "file_name": () => {
        var s = '';
        for(var i = 0, i_limit = this.file_list.length ; i < i_limit ; i++){
          if(s.length > 0){
            s += ', ';
          }
          s += this.file_list[i].name;
        }
        return s;
      },
      */
      "file_name": (() => {
        var s = '';
        for(var i = 0, i_limit = this.file_list.length ; i < i_limit ; i++){
          if(s.length > 0){
            s += ', ';
          }
          s += this.file_list[i].name;
        }
        return s;
      })(),
      "doc_separator": this.suggestionDataSource[0].choice
    });
    window.localStorage.setItem('history',JSON.stringify(this.history_list));
    /* </LOUIS> */
  }

  
  reconvertir(){
    /* <LOUIS> */
    var zis = this;
    // var local_history = window.localStorage.getItem('history');
    var local_history = JSON.parse(window.localStorage.getItem('history'));
    var num_index_in_history = Number(this.index_in_history);
    if(this.index_in_history === null || this.index_in_history === undefined || num_index_in_history >= local_history.length){
      alert('Veuillez insérer un indice d\'historique valide.');
      return;
    }
    /*
    console.log('A');
    var reconv_traces_xhr = new XMLHttpRequest();
    // reconv_traces_xhr.open('POST','traces_bridge.php',true);
    reconv_traces_xhr.open('POST','http://localhost:9000/traces_bridge.php',true);
    reconv_traces_xhr.setRequestHeader("Content-Type", "application/json");
    // reconv_traces_xhr.open('POST','traces_bridge.php',true);
    reconv_traces_xhr.onreadystatechange = function(){
      if(reconv_traces_xhr.readyState === 4 && reconv_traces_xhr.status === 200){
        console.log(reconv_traces_xhr.responseText);
        // reconv_traces_xhr.send(JSON.stringify(local_history[Number(this.index_in_history)]['traces']));
        // reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
        
        console.log('B');
        var reconv_zip_xhr = new XMLHttpRequest();
        // reconv_zip_xhr.setRequestHeader("Content-Type", this.file_to_reconvert.type);
        // reconv_zip_xhr.open('POST','reconv_zip_bridge.php',true);
        reconv_zip_xhr.open('POST','http://localhost:9001/reconv_zip_bridge.php',true);
        reconv_zip_xhr.setRequestHeader("Content-Type", "octet/stream");
        // reconv_zip_xhr.open('POST','reconv_zip_bridge.php',true);
        // reconv_traces_xhr.send(JSON.stringify(local_history[Number(this.index_in_history)]['traces']));
        // reconv_zip_xhr.send(this.file_to_reconvert);
        // reconv_zip_xhr.send(this.file_to_reconvert_content);
        // setTimeout(function(){
        //   reconv_zip_xhr.send(this.file_to_reconvert_content);
        // },500);
        // reconv_zip_xhr.send(this.file_to_reconvert_content);
        // reconv_zip_xhr.send(zis.file_to_reconvert_content);
        reconv_zip_xhr.send(zis.file_to_reconvert);
      }
    }
    
    console.log('C');
    // reconv_traces_xhr.open('POST','traces_bridge.php',true);
    reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
    // window.localStorage.setItem('history',JSON.stringify(this.history_list));
    */




    /*
    var reconv_zip_xhr = new XMLHttpRequest();
    reconv_zip_xhr.onreadystatechange = function(){
      if(reconv_zip_xhr.readyState === 4 && reconv_zip_xhr.status === 200){
        var token = JSON.parse(reconv_zip_xhr.responseText)['token'];
        console.log(token);
        var reconv_traces_xhr = new XMLHttpRequest();
        reconv_traces_xhr.onreadystatechange = function(){
          if(reconv_traces_xhr.readyState === 4 && reconv_traces_xhr.status === 200){
            var reconv_check_status_interval = setInterval(
              () => {
                var reconv_check_status = new XMLHttpRequest();
                reconv_check_status
                reconv_check_status.open("POST","http://localhost:9002/reconv_check_status.php",true);
                reconv_check_status.setRequestHeader("Content-Type", "application/json");
                reconv_check_status.send(JSON.stringify({
                  "token": token
                }));
              },
              2000
            );
          }
        }
        // reconv_traces_xhr.open('POST','traces_bridge.php',true);
        reconv_traces_xhr.open('POST','http://localhost:9000/traces_bridge.php',true);
        reconv_traces_xhr.setRequestHeader("Content-Type", "application/json");
        // reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
        reconv_traces_xhr.send(JSON.stringify({
          "token":token,
          "traces":local_history[num_index_in_history]['traces'] || []
        }));
      }
    }
    reconv_zip_xhr.open('POST','http://localhost:9001/reconv_zip_bridge.php',true);
    reconv_zip_xhr.setRequestHeader("Content-Type", "octet/stream");
    reconv_zip_xhr.send(zis.file_to_reconvert);
    */







    var reconv_token_xhr = new XMLHttpRequest();
    reconv_token_xhr.onreadystatechange = function(){
      if(reconv_token_xhr.readyState === 4 && reconv_token_xhr.status === 200){
        var reconv_zip_xhr = new XMLHttpRequest();
        reconv_zip_xhr.onreadystatechange = function(){
          if(reconv_zip_xhr.readyState === 4 && reconv_zip_xhr.status === 200){
            /*
            var token = JSON.parse(reconv_zip_xhr.responseText)['token'];
            console.log(token);
            var reconv_traces_xhr = new XMLHttpRequest();
            reconv_traces_xhr.onreadystatechange = function(){
              if(reconv_traces_xhr.readyState === 4 && reconv_traces_xhr.status === 200){
                var reconv_check_status_interval = setInterval(
                  () => {
                    var reconv_check_status = new XMLHttpRequest();
                    reconv_check_status
                    // reconv_check_status.open("POST","http://localhost:9002/reconv_check_status.php",true);
                    reconv_check_status.open("POST","reconv_check_status.php",true);
                    reconv_check_status.setRequestHeader("Content-Type", "application/json");
                    reconv_check_status.send(JSON.stringify({
                      "token": token
                    }));
                  },
                  2000
                );
              }
            }
            // reconv_traces_xhr.open('POST','traces_bridge.php',true);
            reconv_traces_xhr.open('POST','http://localhost:9000/traces_bridge.php',true);
            reconv_traces_xhr.setRequestHeader("Content-Type", "application/json");
            // reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
            reconv_traces_xhr.send(JSON.stringify({
              "token":token,
              "traces":local_history[num_index_in_history]['traces'] || []
            }));
            */



            var reconv_download_xhr = new XMLHttpRequest();
            reconv_download_xhr.open('POST','reconv_download_project.php',true);

            reconv_download_xhr.onreadystatechange = function(){
              if(reconv_download_xhr.readyState === 4 && reconv_download_xhr.status === 200){
                // console.log(dl_xhr.responseText);
                // var blob = new Blob([dl_xhr.response], { type: "application/zip" });
                // var blob = new Blob([dl_xhr.response], { type: "application/zip;charset=utf-8" });
                // var blob = new Blob([dl_xhr.responseText], { type: "application/zip;charset=utf-8" });
                // var blob = new Blob([dl_xhr.responseText], { type: "text/plain;charset=utf-8" });
                
                var blob = new Blob([reconv_download_xhr.response], { type: "octet/stream" });
                saveAs(blob, "inception-project-reconverted"+Date.now()+".zip");
                
                // ;charset=utf-8
              }
            }
            // THIS LINE RIGHT HERE MADE THE DIFFERENCE
            reconv_download_xhr.responseType = 'arraybuffer';
            reconv_download_xhr.send(reconv_zip_xhr.responseText);
          }
        }
        // reconv_zip_xhr.open('POST','http://localhost:9001/reconv_zip_bridge.php',true);
        reconv_zip_xhr.open('POST','reconv_zip_bridge.php',true);
        // reconv_zip_xhr.setRequestHeader("Content-Type", "application/json");
        reconv_zip_xhr.setRequestHeader("Content-Type", "octet/stream");
        // console.log(local_history[num_index_in_history]['token']);
        // reconv_zip_xhr.send(JSON.stringify({"token":local_history[num_index_in_history]['token'],"zip":zis.file_to_reconvert}));
        reconv_zip_xhr.send(zis.file_to_reconvert);
      }
    }
    reconv_token_xhr.open("POST","reconv_get_token.php",true);
    reconv_token_xhr.setRequestHeader("Content-Type", "application/json");
    reconv_token_xhr.send(JSON.stringify({"token":local_history[num_index_in_history]['token']}));
      
    /* </LOUIS> */
  }


  reconvertir_n(){
    /* <LOUIS> */
    var zis = this;
    // var local_history = window.localStorage.getItem('history');
    var local_history = JSON.parse(window.localStorage.getItem('history'));
    var num_index_in_history = Number(this.index_in_history);
    if(this.index_in_history === null || this.index_in_history === undefined || num_index_in_history >= local_history.length){
      alert('Veuillez insérer un indice d\'historique valide.');
      return;
    }
    /*
    console.log('A');
    var reconv_traces_xhr = new XMLHttpRequest();
    // reconv_traces_xhr.open('POST','traces_bridge.php',true);
    reconv_traces_xhr.open('POST','http://localhost:9000/traces_bridge.php',true);
    reconv_traces_xhr.setRequestHeader("Content-Type", "application/json");
    // reconv_traces_xhr.open('POST','traces_bridge.php',true);
    reconv_traces_xhr.onreadystatechange = function(){
      if(reconv_traces_xhr.readyState === 4 && reconv_traces_xhr.status === 200){
        console.log(reconv_traces_xhr.responseText);
        // reconv_traces_xhr.send(JSON.stringify(local_history[Number(this.index_in_history)]['traces']));
        // reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
        
        console.log('B');
        var reconv_zip_xhr = new XMLHttpRequest();
        // reconv_zip_xhr.setRequestHeader("Content-Type", this.file_to_reconvert.type);
        // reconv_zip_xhr.open('POST','reconv_zip_bridge.php',true);
        reconv_zip_xhr.open('POST','http://localhost:9001/reconv_zip_bridge.php',true);
        reconv_zip_xhr.setRequestHeader("Content-Type", "octet/stream");
        // reconv_zip_xhr.open('POST','reconv_zip_bridge.php',true);
        // reconv_traces_xhr.send(JSON.stringify(local_history[Number(this.index_in_history)]['traces']));
        // reconv_zip_xhr.send(this.file_to_reconvert);
        // reconv_zip_xhr.send(this.file_to_reconvert_content);
        // setTimeout(function(){
        //   reconv_zip_xhr.send(this.file_to_reconvert_content);
        // },500);
        // reconv_zip_xhr.send(this.file_to_reconvert_content);
        // reconv_zip_xhr.send(zis.file_to_reconvert_content);
        reconv_zip_xhr.send(zis.file_to_reconvert);
      }
    }
    
    console.log('C');
    // reconv_traces_xhr.open('POST','traces_bridge.php',true);
    reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
    // window.localStorage.setItem('history',JSON.stringify(this.history_list));
    */




    /*
    var reconv_zip_xhr = new XMLHttpRequest();
    reconv_zip_xhr.onreadystatechange = function(){
      if(reconv_zip_xhr.readyState === 4 && reconv_zip_xhr.status === 200){
        var token = JSON.parse(reconv_zip_xhr.responseText)['token'];
        console.log(token);
        var reconv_traces_xhr = new XMLHttpRequest();
        reconv_traces_xhr.onreadystatechange = function(){
          if(reconv_traces_xhr.readyState === 4 && reconv_traces_xhr.status === 200){
            var reconv_check_status_interval = setInterval(
              () => {
                var reconv_check_status = new XMLHttpRequest();
                reconv_check_status
                reconv_check_status.open("POST","http://localhost:9002/reconv_check_status.php",true);
                reconv_check_status.setRequestHeader("Content-Type", "application/json");
                reconv_check_status.send(JSON.stringify({
                  "token": token
                }));
              },
              2000
            );
          }
        }
        // reconv_traces_xhr.open('POST','traces_bridge.php',true);
        reconv_traces_xhr.open('POST','http://localhost:9000/traces_bridge.php',true);
        reconv_traces_xhr.setRequestHeader("Content-Type", "application/json");
        // reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
        reconv_traces_xhr.send(JSON.stringify({
          "token":token,
          "traces":local_history[num_index_in_history]['traces'] || []
        }));
      }
    }
    reconv_zip_xhr.open('POST','http://localhost:9001/reconv_zip_bridge.php',true);
    reconv_zip_xhr.setRequestHeader("Content-Type", "octet/stream");
    reconv_zip_xhr.send(zis.file_to_reconvert);
    */







    var reconv_token_xhr = new XMLHttpRequest();
    reconv_token_xhr.onreadystatechange = function(){
      if(reconv_token_xhr.readyState === 4 && reconv_token_xhr.status === 200){
        var reconv_zip_xhr = new XMLHttpRequest();
        reconv_zip_xhr.onreadystatechange = function(){
          if(reconv_zip_xhr.readyState === 4 && reconv_zip_xhr.status === 200){
            /*
            var token = JSON.parse(reconv_zip_xhr.responseText)['token'];
            console.log(token);
            var reconv_traces_xhr = new XMLHttpRequest();
            reconv_traces_xhr.onreadystatechange = function(){
              if(reconv_traces_xhr.readyState === 4 && reconv_traces_xhr.status === 200){
                var reconv_check_status_interval = setInterval(
                  () => {
                    var reconv_check_status = new XMLHttpRequest();
                    reconv_check_status
                    // reconv_check_status.open("POST","http://localhost:9002/reconv_check_status.php",true);
                    reconv_check_status.open("POST","reconv_check_status.php",true);
                    reconv_check_status.setRequestHeader("Content-Type", "application/json");
                    reconv_check_status.send(JSON.stringify({
                      "token": token
                    }));
                  },
                  2000
                );
              }
            }
            // reconv_traces_xhr.open('POST','traces_bridge.php',true);
            reconv_traces_xhr.open('POST','http://localhost:9000/traces_bridge.php',true);
            reconv_traces_xhr.setRequestHeader("Content-Type", "application/json");
            // reconv_traces_xhr.send(JSON.stringify(local_history[num_index_in_history]['traces']));
            reconv_traces_xhr.send(JSON.stringify({
              "token":token,
              "traces":local_history[num_index_in_history]['traces'] || []
            }));
            */



            var reconv_download_xhr = new XMLHttpRequest();
            reconv_download_xhr.open('POST','reconv_download_project.php',true);

            reconv_download_xhr.onreadystatechange = function(){
              if(reconv_download_xhr.readyState === 4 && reconv_download_xhr.status === 200){
                // console.log(dl_xhr.responseText);
                // var blob = new Blob([dl_xhr.response], { type: "application/zip" });
                // var blob = new Blob([dl_xhr.response], { type: "application/zip;charset=utf-8" });
                // var blob = new Blob([dl_xhr.responseText], { type: "application/zip;charset=utf-8" });
                // var blob = new Blob([dl_xhr.responseText], { type: "text/plain;charset=utf-8" });
                
                var blob = new Blob([reconv_download_xhr.response], { type: "octet/stream" });
                saveAs(blob, "inception-project-reconverted"+Date.now()+".zip");
                
                // ;charset=utf-8
              }
            }
            // THIS LINE RIGHT HERE MADE THE DIFFERENCE
            reconv_download_xhr.responseType = 'arraybuffer';
            reconv_download_xhr.send(reconv_zip_xhr.responseText);
          }
        }
        // reconv_zip_xhr.open('POST','http://localhost:9001/reconv_zip_bridge.php',true);
        reconv_zip_xhr.open('POST','reconv_zip_bridge_n.php',true);
        // reconv_zip_xhr.setRequestHeader("Content-Type", "application/json");
        reconv_zip_xhr.setRequestHeader("Content-Type", "octet/stream");
        // console.log(local_history[num_index_in_history]['token']);
        // reconv_zip_xhr.send(JSON.stringify({"token":local_history[num_index_in_history]['token'],"zip":zis.file_to_reconvert}));
        reconv_zip_xhr.send(zis.file_to_reconvert);
      }
    }
    reconv_token_xhr.open("POST","reconv_get_token.php",true);
    reconv_token_xhr.setRequestHeader("Content-Type", "application/json");
    reconv_token_xhr.send(JSON.stringify({"token":local_history[num_index_in_history]['token']}));
      
    /* </LOUIS> */
  }


  toggle_input_display(){
    /*
    var new_display = 'none';
    if(this.auto_authentication){
      new_display = 'block';
    }
    document.getElementById('project_name_input').style.display = new_display;
    document.getElementById('inception_id_input').style.display = new_display;
    document.getElementById('inception_password_input').style.display = new_display;
    console.log('toggle');
    */
    if(this.auto_authentication){
      document.getElementById('project_name_input').style.display = 'inline';


      /*
      var id_input = document.getElementById('inception_id_input');
      
      if(this.inception_id === ''){
        var stored_id = window.localStorage.getItem('id');
        if(stored_id !== null){
          // id_input.value = stored_id;
          this.inception_id = stored_id;
        }
      }
      
      id_input.style.display = 'inline';



      var password_input = document.getElementById('inception_password_input');
      
      if(this.inception_password === ''){
        var stored_password = window.localStorage.getItem('password');
        if(stored_password !== null){
          // password_input.value = stored_password;
          this.inception_password = stored_password;
        }
      }
      
      password_input.style.display = 'inline';





      var inception_input = document.getElementById('inception_url_input');
      
      if(this.inception_url === ''){
        var stored_url = window.localStorage.getItem('inception_url');
        if(stored_url !== null){
          // password_input.value = stored_password;
          this.inception_url = stored_url;
        }
      }
      
      inception_input.style.display = 'inline';
      */
    }else{
      /*
      document.getElementById('project_name_input').style.display = 'none';
      document.getElementById('inception_id_input').style.display = 'none';
      document.getElementById('inception_password_input').style.display = 'none';
      document.getElementById('inception_url_input').style.display = 'none';
      */
    }
  }

  onToolbarPreparing(e) {
    var toolbarItems = e.toolbarOptions.items;


    /*
    toolbarItems.push({
      location: 'before',
      widget: 'dxSelectBox',
      locateInMenu: 'auto',
      options: {
        hint: "Type d'annotation",
        items: this.tagTypes,
        value: this.tagTypes[0].value,
        displayExpr: "label",
        valueExpr: "value",
        disabled: false,
        onValueChanged: (args) => {
          this.lastSelectedTagType = args.value;
        }
      }
    }
    );
    */

    /*
    toolbarItems.push({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        type: 'normal',
        hint: 'Ajouter un tag XML',
        text: 'Ajouter',
        disabled: true,
        onInitialized: (e) => {
          this.addTagButtonComponent =   e.component; // enabled only on xml table row selection
        },
        onClick: () => {
          if (this.lastSelectedTag) {

            var colour = this.tagTypes[this.lastSelectedTagType].color;
            if (this.lastSelectedTagType == 3) // custom annotation
            {
              var cnt = 0;
              this.tagdefDataSource.map(e => {
                if (e.type == 3) cnt++;
              });
              colour = this.tagColors[cnt];
            }

            var ne = {
              id: this.tagdefDataSource.length,
              attrs:   this.recupAttrNames(this.lastSelectedAttrs[0]),  
              attrsstr: this.lastSelectedAttrs[1],
              tag: this.lastSelectedTag,
              constraint: [],
              type: this.tagTypes[this.lastSelectedTagType].value,
              color: colour,
            };
            this.tagdefDataSource.push(ne);

            this.docTagMap[this.lastSelectedTag] = colour;
            if (this.xmlGrid.instance) this.xmlGrid.instance.refresh();
          }
        }
      }
    }
    );
    */


    /*
    toolbarItems.push({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        type: 'normal',
        hint: 'Générer',
        text: 'Générer',
        disabled: false,
        onInitialized: (e) => {

        },
        onClick: () => {
          this.typesystemGeneration();
          this.generatePythonParser();

          this.tabPanel.selectedIndex=1;
          this.popupTagsVisible = false;
          this.popupSelectVisible = false;
        }
      }
    }
    );
    */




    /*
    toolbarItems.push({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        type: 'normal',
        hint: 'Collecte toutes les balises',
        text: 'Collecter',
        disabled: false,
        onInitialized: (e) => {

        },
        onClick: () => {
          // if(!this.tagdefDataSource || this.tagdefDataSource.length<1)
          // alert("Il faut d'abord chager un fichier");
          // else
          this.collectTags();
          
        }
      }
    }
    );
    */
    

    /* <LOUIS> */
    /*
    toolbarItems.push({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        type: 'normal',
        hint: 'Suggère certaines balises',
        text: 'Suggérer',
        disabled: false,
        onInitialized: (e) => {
          // this.popupTagsVisible = false;
        },
        onClick: () => {
          // if(!this.tagdefDataSource || this.tagdefDataSource.length<1)
          // alert("Il faut d'abord chager un fichier");
          // else
          // this.collectTags();
          console.log("Bouton 'suggérer'");
          // var button = document.getElementById('suggestionBox');
          // console.log(button);
          // button.style.display = 'block';
          // this.popupTagsVisible = true;
          this.suggestionPopupTagsVisible = true;
        }
      }
    }
    );
    */

    /*
    toolbarItems.push({
      location: 'before',
      widget: 'dxButton',
      locateInMenu: 'auto',
      options: {
        type: 'normal',
        hint: 'Mettre à jour le type des balises',
        text: 'Mise à jour',
        disabled: false,
        onInitialized: (e) => {
          // this.popupTagsVisible = false;
        },
        onClick: () => {
          // if(!this.tagdefDataSource || this.tagdefDataSource.length<1)
          // alert("Il faut d'abord chager un fichier");
          // else
          // this.collectTags();
          console.log("Bouton 'mise à jour'");
          // var button = document.getElementById('suggestionBox');
          // console.log(button);
          // button.style.display = 'block';
          // this.popupTagsVisible = true;
          // this.suggestionPopupTagsVisible = true;

          for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
            // if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[0].choice && this.tagdefDataSource[i].type === 0){
            //   this.tagdefDataSource[i].type = 3;
            // }else if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[1].choice && this.tagdefDataSource[i].type === 1){
            //   this.tagdefDataSource[i].type = 3;
            // }else if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[2].choice && this.tagdefDataSource[i].type === 2){
            //   this.tagdefDataSource[i].type = 3;
            // }

            // if(this.tagdefDataSource[i].tag === this.suggestionDataSource[0].choice){
            //   if(this.tagdefDataSource[i].type === 0)
            //   this.tagdefDataSource[i].type = 3;
            // }

            if(this.tagdefDataSource[i].tag === this.suggestionDataSource[0].choice){
              this.tagdefDataSource[i].type = 0; 
            }else if(this.tagdefDataSource[i].tag === this.suggestionDataSource[1].choice){
              this.tagdefDataSource[i].type = 1; 
            }else if(this.tagdefDataSource[i].tag === this.suggestionDataSource[2].choice){
              this.tagdefDataSource[i].type = 2; 
            }else{
              this.tagdefDataSource[i].type = 3;
            }
          }
        }
      }
    }
    );
    */
    /* </LOUIS> */

  }



  onSelectionChanged(e: any) {
    if (e.currentSelectedRowKeys && e.currentSelectedRowKeys.length > 0) {
      this.addTagButtonComponent.option("disabled", false);
      this.lastSelectedTag = e.selectedRowsData[0].elem;
      this.lastSelectedAttrs = [e.selectedRowsData[0].attrs, e.selectedRowsData[0].attrsstr];
    }
    else {
      this.addTagButtonComponent.option("disabled", true);
      this.lastSelectedTag = undefined;
    }
  }





  onRowUpdated(e: any) {
    // console.log(e);
    if (e.data.tag in this.docTagMap) {
      this.docTagMap[this.lastSelectedTag] = e.data.color;
      // this.xmlGrid.instance.refresh();
    }
  }


  attrToString(attrs) {
    var str = "";
    /*
    for (var i = 0; i < attrs.length; i++) {
      str = str + attrs[i][0] + "=\"" + attrs[i][1] + "\" ";
    }
    */
    var local_keys = Object.keys(attrs);
    for(var i = 0, i_limit = local_keys.length ; i < i_limit ; i++){
      str += ' ' + local_keys[i] + '="' + attrs[local_keys[i]] + '"';
    }
    return str;
  }

  recupAttrNames(attrs) {
  //  console.log("recupAttrNames attrs=", attrs);
  /*
    var anames = [];
    if(attrs==null || attrs.length==0) return anames;
    for (var a of Object.keys(attrs)) {
      anames.push(a[0]);
    }
    return anames;
    */
    if(!(attrs)){
      return [];
    }else{
      return Object.keys(attrs);
    }
  }

  normalizeAttributeName(tag, aname) {
    var attr = aname;
    if(aname == "type")
      attr = tag + "_" + attr;
      attr = attr.replace("-", "_");
      attr = attr.replace(".", "_d_");
      attr = attr.replace(":", "__");
    
    return attr.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }


  collectTags() {

    var count=0;
    var dic: any = {};
    var tddic: any = {};

    /* <LOUIS */
    var docMinChar = 200;
    // var docMaxChar = 10000;
    var docMinQuantity = 5;
    var standardParagraphNames = ["p","par","paragraph"];
    var standardDocumentNames = ["text","body"];
    // console.log(this.tagdefDataSource);
    /* </LOUIS> */

    this.tagdefDataSource.map(e => {
      tddic[e.tag] = e.attrs;
    });

    this.docDataSource.map(e => {

      if (!(e.elem in dic)) {
        if (!(e.elem in tddic)) {
          

          var colour = this.hexToRgbA(this.getRandomColor());
          this.docTagMap[e.elem] = colour;
         // console.log("COLLECT ", e.elem, e.attrs);
          var ne = {
            id: this.tagdefDataSource.length,
            attrs: this.recupAttrNames(e.attrs),
            attrsstr: this.attrToString(e.attrs),
            tag: e.elem,
            constraint: [],
            /* <LOUIS> */
            // type: count<2 ? 0 : 3,
            // type: dic[e.elem].quantity >= docMinQuantity && dic[e.elem].averageCharCount >= docMinChar ? 0 : 3,
            type: 3,
            /* </LOUIS> */
            color: colour,
            /* <LOUIS> */
            // quantity: 0,
            quantity: 1,
            averageCharCount: 0,
            chainingRatio: 0
            /* </LOUIS */
          };
          dic[e.elem] = ne;
          this.tagdefDataSource.push(ne);

        } 
        count++;
      } else {
        // We already ran on this tag, but let's check whether all same attributes were collected
        var already = dic[e.elem].attrs;
        var ldat = {}
        already.map( i=> { ldat[i]=i } );
        var tags = this.recupAttrNames(e.attrs);
        tags.map( i=> { 
          if(!(i in ldat)) {
           // console.log("Found extra " + i + " on " + e.elem);
            dic[e.elem].attrs.push(i);
          }
         } );
         /* <LOUIS> */
         dic[e.elem].quantity++;
         dic[e.elem].averageCharCount = this.tagsAverageContentLength[e.elem].average;
        //  dic[e.elem].averageCharCount = zis.tagsAverageContentLength[e.elem];
        if(!(e.elem in this.tagsChainingRatio)){
          this.tagsChainingRatio[e.elem] = {
            count: 0,
            total_count: 0,
            ratio: 0
          };
        }
        dic[e.elem].chainingRatio = this.tagsChainingRatio[e.elem].ratio;




        
        /*  
        if(standardParagraphNames.indexOf(e.elem) !== -1){
          dic[e.elem].type = 1;
          if(this.suggestionDataSource[1].suggestions.indexOf(e.elem) === -1){
            this.suggestionDataSource[1].suggestions.push(e.elem);
            if(this.suggestionDataSource[1].suggestions_str.length > 0){
              this.suggestionDataSource[1].suggestions_str += ', ';
            }
            this.suggestionDataSource[1].suggestions_str += (e.elem);
          }
        }else if((dic[e.elem].quantity >= docMinQuantity && dic[e.elem].averageCharCount >= docMinChar) || standardDocumentNames.indexOf(e.elem) !== -1){
          dic[e.elem].type = 0;
          // console.log("doc",e.elem);
          this.suggestionDataSource[0].suggestions.push(e.elem);
          // console.log("pushed");
          if(this.suggestionDataSource[0].suggestions.indexOf(e.elem) === -1){
            if(this.suggestionDataSource[0].suggestions_str.length > 0){
              this.suggestionDataSource[0].suggestions_str += ', ';
            }
            this.suggestionDataSource[0].suggestions_str += (e.elem);
            // console.log("concatenated");
          }
        }
        */
         /* </LOUIS */
      }

      /* <LOUIS> */
      if(standardParagraphNames.indexOf(e.elem) !== -1){
        dic[e.elem].type = 1;
        if(this.suggestionDataSource[1].suggestions.indexOf(e.elem) === -1){
          // this.suggestionDataSource[1].suggestions.append(e.elem);
          this.suggestionDataSource[1].suggestions.push(e.elem);
          if(this.suggestionDataSource[1].suggestions_str.length > 0){
            this.suggestionDataSource[1].suggestions_str += ', ';
          }
          this.suggestionDataSource[1].suggestions_str += (e.elem);
        }
      }else if((dic[e.elem].quantity >= docMinQuantity && dic[e.elem].averageCharCount >= docMinChar) || standardDocumentNames.indexOf(e.elem) !== -1){
        dic[e.elem].type = 0;
        // console.log("doc",e.elem);
        if(this.suggestionDataSource[0].suggestions.indexOf(e.elem) === -1){
          // this.suggestionDataSource[0].suggestions.append(e.elem);
          this.suggestionDataSource[0].suggestions.push(e.elem);
          // console.log("pushed");
          if(this.suggestionDataSource[0].suggestions_str.length > 0){
            this.suggestionDataSource[0].suggestions_str += ', ';
          }
          this.suggestionDataSource[0].suggestions_str += (e.elem);
          // console.log("concatenated");
        }
      }
      /* </LOUIS */

    });


  }


  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  hexToRgbA(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)';
    }
    throw new Error('Bad Hex');
  }






  typesystemGeneration() {

    var typeDescriptions = "";

    this.tagdefDataSource.map(e => {

      if (e.type == 3) {

        typeDescriptions = typeDescriptions + this.typeDescriptionGenerator(e.tag, e.attrs);

      }
     
    });


    this.typesystem = this.typesystemTemplate.replace("[TYPEDESCRIPTION_PLACEHOLDER]", typeDescriptions);
  }



  typeDescriptionGenerator(name, attrs): string {
    // console.log("typeDescriptionGenerator for: "+ name);
    // console.log(attrs);
    var description = "\n\n<typeDescription>" + "\n";
    description = description + "<name>webanno.custom." + name + "</name>" + "\n";
    description = description + "<description/>" + "\n";
    description = description + "<supertypeName>uima.tcas.Annotation</supertypeName>" + "\n";
    description = description + "<features>" + "\n";
    if(attrs && attrs.length>0)
    attrs.map(e => {
      // console.log("<name>" + e + "</name>");
      description = description + "<featureDescription>" + "\n";
      description = description + "<name>" + this.normalizeAttributeName(name, e) + "</name>" + "\n";
      description = description + "<description/> " + "\n";
      description = description + "<rangeTypeName>uima.cas.String</rangeTypeName>" + "\n";
      description = description + "</featureDescription>" + "\n";
    });
    description = description + "</features>" + "\n";
    description = description + "</typeDescription>" + "\n";

    return description;
  }

  dowloadPython() {
    
    var blob = new Blob([this.pythonCode], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "split-and-convert.py");
    
   /*
   var zip = new JSZip();
    zip.file('inception_project/split-and-convert.py',this.pythonCode);
    zip.generateAsync({type: 'blob'}).then(function(content){
      saveAs(content,'test_zip.zip');
    });
    */
  }


  downloadTypesystem() {
    var blob = new Blob([this.typesystem], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "typesystem.xml");
  }

  /* <LOUIS> */

  downloadZip(){
    var zip = new JSZip();
    zip.file('inception_project/split-and-convert.py',this.pythonCode);
    zip.file('inception_project/data/typesystem.xml',this.typesystem);
    // zip.file('inception_project/data/'+this.fichierXML,this.uploadedXML);
    // console.log(this.file_list);
    for(var i = 0, i_limit = this.file_list.length ; i < i_limit ; i++){
      zip.file('inception_project/data/'+this.file_list[i].name,this.file_list[i])
    }
    zip.generateAsync({type: 'blob'}).then(function(content){
      saveAs(content,'inception_project.zip');
    });
  }

  updateSystem(){
    // if(!this.tagdefDataSource || this.tagdefDataSource.length<1)
    // alert("Il faut d'abord chager un fichier");
    // else
    // this.collectTags();
    // console.log("Bouton 'mise à jour'");
    // var button = document.getElementById('suggestionBox');
    // console.log(button);
    // button.style.display = 'block';
    // this.popupTagsVisible = true;
    // this.suggestionPopupTagsVisible = true;

    for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
      // if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[0].choice && this.tagdefDataSource[i].type === 0){
      //   this.tagdefDataSource[i].type = 3;
      // }else if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[1].choice && this.tagdefDataSource[i].type === 1){
      //   this.tagdefDataSource[i].type = 3;
      // }else if(this.tagdefDataSource[i].tag !== this.suggestionDataSource[2].choice && this.tagdefDataSource[i].type === 2){
      //   this.tagdefDataSource[i].type = 3;
      // }

      // if(this.tagdefDataSource[i].tag === this.suggestionDataSource[0].choice){
      //   if(this.tagdefDataSource[i].type === 0)
      //   this.tagdefDataSource[i].type = 3;
      // }

      if(this.tagdefDataSource[i].tag === this.suggestionDataSource[0].choice){
        this.tagdefDataSource[i].type = 0; 
      }else if(this.tagdefDataSource[i].tag === this.suggestionDataSource[1].choice){
        this.tagdefDataSource[i].type = 1; 
      }else if(this.tagdefDataSource[i].tag === this.suggestionDataSource[2].choice){
        this.tagdefDataSource[i].type = 2; 
      }else{
        this.tagdefDataSource[i].type = 3;
      }
    }

    var contrainte = false;
    for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
      if(this.tagdefDataSource[i]['tag'] === this.suggestionDataSource[0].choice){
        if(this.tagdefDataSource[i]['constraint'] === 1){
          contrainte = true;
        }else{
          contrainte = false;
        }
        break;
      }
    }

    var tag_count = 0;
    // var first_document_regex_pattern = '<'+this.suggestionDataSource[0].choice+'[\\w\\W]*(?<!</'+this.suggestionDataSource[0].choice+'>)</'+this.suggestionDataSource[0].choice+'>';
    var first_document_regex_pattern = '</?' + this.suggestionDataSource[0].choice + '(?:[ />])';
    var first_document_regex_result_list = [];
    // console.log(first_document_regex_pattern);
    var first_document_regex = new RegExp(first_document_regex_pattern,'g')
    // var first_document_regex_result = first_document_regex.exec(this.full_xml);
    // if(first_document_regex_result !== null){
    //   this.first_document = first_document_regex_result[0];
    // }else{
    //   console.log("Couldn't find first document");
    // }
    var first_document_regex_result;
    while((first_document_regex_result = first_document_regex.exec(this.full_xml)) !== null){
    // while((first_document_regex_result = first_document_regex.exec(this.file_list[0])) !== null){
      first_document_regex_result_list.push([first_document_regex_result.index,first_document_regex_result[0]]);
      if(first_document_regex_result[0][1] !== '/'){
        tag_count++;
      }else{
        tag_count--;
        if(contrainte){
          if(tag_count === 0){
              this.first_document = this.full_xml.slice(first_document_regex_result_list[0][0],first_document_regex_result_list[first_document_regex_result_list.length-1][0]);
            // this.first_document = this.file_list[0].slice(first_document_regex_result_list[0][0],first_document_regex_result_list[first_document_regex_result_list.length-1][0]);
            break;
          }
        }else{
          this.first_document = this.full_xml.slice(first_document_regex_result_list[first_document_regex_result_list.length-2][0],first_document_regex_result_list[first_document_regex_result_list.length-1][0]);
          // this.first_document = this.file_list[0].slice(first_document_regex_result_list[first_document_regex_result_list.length-2][0],first_document_regex_result_list[first_document_regex_result_list.length-1][0]);
          break;
        }
      }
    }

    // this.firstDocumentVisible = true;

    var tag_replacement_pattern = '</?[^>]+>';
    var tag_replacement_regex = new RegExp(tag_replacement_pattern,'g');
    this.first_document = this.first_document.replace(tag_replacement_regex,'');

    // var whitespace_replacement_pattern = '\\s(\\s*)';
    var whitespace_replacement_pattern = '(\\s)\\s*';
    var whitespace_replacement_regex = new RegExp(whitespace_replacement_pattern,'g');
    this.first_document = this.first_document.replace(whitespace_replacement_regex,'$1');

    var early_whitespace_replacement_pattern = '^\\s*';
    var early_whitespace_replacement_regex = new RegExp(early_whitespace_replacement_pattern,'g');
    this.first_document = this.first_document.replace(early_whitespace_replacement_regex,'');


    for(var i = 0, i_limit = this.tagdefDataSource.length ; i < i_limit ; i++){
      if(this.tagdefDataSource[i]['tag'] === this.suggestionDataSource[0].choice){
        this.number_of_documents = this.tagdefDataSource[i]['quantity'];
        // console.log("number of documents found", this.number_of_documents);
        break;
      }
    }

    var nb_doc = this.number_of_documents;
    var nb_uploaded_files = this.file_list.length;

    this.firstDocumentVisible = true;
    // document.getElementById('first_document_announcer_span').style.display = 'block';
    // document.getElementById('number_of_documents_span').innerText = (~~(this.number_of_documents/2)).toString();
    var display_interval = setInterval(function(){
      /*
      var local_span = document.getElementById('number_of_documents_span');
      if(local_span !== null){
        local_span.innerText = (~~(this.number_of_documents/2)).toString();
        clearInterval(display_interval);
      }
      */
     try{
      // document.getElementById('number_of_documents_span').innerText = (~~(this.number_of_documents/2)).toString();
      // document.getElementById('number_of_documents_span').innerText = (~~(nb_doc/2)).toString();
      // document.getElementById('number_of_documents_span').innerText = (~~(nb_doc/2)*this.file_list.length).toString() + '(approximation)';
      document.getElementById('number_of_documents_span').innerText = (~~(nb_doc/2)*nb_uploaded_files).toString() + ' [approximation]';
        clearInterval(display_interval);
     }catch(err){
      
     }
      // console.log('interval !');
      
    },250);
    // console.log(this.number_of_documents);
  }
  /* </LOUIS> */

  generateJSONForServerRequest(){
    // console.log(this.uploadedXML);
    var JSON_obj = {};
    JSON_obj["name"] = this.project_name;
    // JSON_obj["slug"] = (new RegExp("\\s","gmi"))
    JSON_obj["slug"] = this.project_name.replace((new RegExp("\\s","gmi")),"");
    JSON_obj["description"] = "";
    JSON_obj["mode"] = "annotation";
    JSON_obj["version"] = 1;
    JSON_obj["source_documents"] = [];
    var now = Date.now();
    for(var i = 0, i_limit = this.file_list.length ; i < i_limit ; i++){
      JSON_obj["source_documents"].push({
        "name": this.file_list[i].name,
        "format": "xml",
        "state": "NEW",
        "timestamp": null,
        "created": now,
        "updated": now,
        // "content": this.file_list[i]["content"]
        "content": this.file_list[i].text().value || this.file_contents[i]
      });
    }
    JSON_obj["tags_roles"] = this.suggestionDataSource;
    // JSON_obj["python_code"] = this.pythonCode;
    JSON_obj["typesystem_xml"] = this.typesystem;
    JSON_obj["target_doc_count"] = this.number_of_documents * this.file_list.length;
    JSON_obj["tagdefDataSource"] = this.tagdefDataSource;
    JSON_obj["nb_doc"] = (~~(this.file_list.length*this.number_of_documents/2));
    JSON_obj["output_name"] = this.fichierXML;

    // console.log(JSON_obj);


    this.JSONForServerRequest = JSON.stringify(JSON_obj);

    // console.log(this.JSONForServerRequest);
  }

  queryServerWithJSON(){
    var zis = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4 && xhr.status == 200){
        // console.log("Request successful (200):",xhr.responseText);

        var xhr_parsed_response = JSON.parse(xhr.responseText);

        zis.history_list[zis.history_list.length-1]['token'] = xhr_parsed_response['token'];
        
        var check_status_interval = setInterval(() => {
          var cs_xhr = new XMLHttpRequest();
          cs_xhr.onreadystatechange = function(){
            if(cs_xhr.readyState === 4 && cs_xhr.status === 200){
              // console.log(cs_xhr.responseText);
              try{
                var cs_xhr_obj = JSON.parse(cs_xhr.responseText);
                if(cs_xhr_obj.status === "complete"){
                  clearInterval(check_status_interval);
                  zis.conversion_progress = 100;

                  // TESTING IN PREPARATION TO RECONVERSION
                  zis.history_list[zis.history_list.length-1]['traces'] = cs_xhr_obj['traces'];
                  console.log(cs_xhr_obj['traces']);
                  window.localStorage.setItem('history',JSON.stringify(zis.history_list));

                  /*
                  var link = document.createElement('a');
                  link.href = conversion_server_url+'/tmp/'+xhr_parsed_response['token']+'/project_archive.zip';
                  link.target = '_blank';
                  link.click();
                  */

                  
                  var dl_xhr = new XMLHttpRequest();
                  // dl_xhr.open("POST",conversion_server_url+'/download_project',true);
                  // dl_xhr.open("GET",conversion_server_url+'/download_project?token',true);
                  // THIS ONE USED TO WORK IN DIRECT
                  // dl_xhr.open("GET",conversion_server_url+'/tmp/'+xhr_parsed_response['token']+'/project_archive.zip',true);
                  // dl_xhr.open("GET",conversion_server_url+'/tmp_inception_converter/'+xhr_parsed_response['token']+'/project_archive.zip',true);
                  // dl_xhr.open("GET",conversion_server_url+'/'+xhr_parsed_response['token']+'/project_archive.zip',true);
                  // dl_xhr.open("POST",conversion_server_url+'/download_project.php',true);
                  dl_xhr.open("POST",'/download_project.php',true);
                  // dl_xhr.open("POST",conversion_server_url+'/download_project',true);
                  // dl_xhr.setRequestHeader("Content-type","application/json");
                  dl_xhr.onreadystatechange = function(){
                    if(dl_xhr.readyState === 4 && dl_xhr.status === 200){
                      // console.log(dl_xhr.responseText);
                      // var blob = new Blob([dl_xhr.response], { type: "application/zip" });
                      // var blob = new Blob([dl_xhr.response], { type: "application/zip;charset=utf-8" });
                      // var blob = new Blob([dl_xhr.responseText], { type: "application/zip;charset=utf-8" });
                      // var blob = new Blob([dl_xhr.responseText], { type: "text/plain;charset=utf-8" });
                      
                      var blob = new Blob([dl_xhr.response], { type: "octet/stream" });
                      // saveAs(blob, "inception-project"+Date.now()+".zip");
                      saveAs(blob, zis.project_name.replace((new RegExp("\\s","gmi")),"_")+"-inception-project"+Date.now()+".zip");
                      
                      // ;charset=utf-8

                      zis.converting = false;
                    }
                  }
                  // dl_xhr.send(xhr.responseText);
                  // THIS LINE RIGHT HERE MADE THE DIFFERENCE
                  dl_xhr.responseType = 'arraybuffer';
                  // dl_xhr.send();
                  dl_xhr.send(xhr.responseText);
                  


                }else if(cs_xhr_obj.status === "in process"){
                  zis.conversion_progress = cs_xhr_obj.progress;
                }
                // document.getElementById('conversion_progress_bar').value = zis.conversion_progress;
              }catch(e){
                console.log('interval server error\n',e);
              }
            }
          }
          // var cs_url = conversion_server_url + '/check_status';
          // var cs_url = conversion_server_url + '/check_status.php';
          var cs_url = '/check_status.php';
          // cs_xhr.open("GET",cs_url,true);
          cs_xhr.open("POST",cs_url,true);
          cs_xhr.setRequestHeader("Content-Type", "application/json");
          // console.log('sending:',xhr.responseText);
          cs_xhr.send(xhr.responseText);
        },2000);
        
      }
    }
    // var url = conversion_server_url+"/split_and_convert?";
    // var url = conversion_server_url+"/split_and_convert";
    // var url = conversion_server_url+"/split_and_convert.php";
    var url = "/split_and_convert.php";
    // url += 'json_content=' + this.JSONForServerRequest;
    xhr.open("POST",url,true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(this.JSONForServerRequest);
    // console.log("Request sent:",url);
  }


  generatePythonParser() {

    var finishedTopicTestPassed = false;

    var code: any = {};
    code.startTag = `
\tdef startElement(self, tag, attrs):
\t\tself.depth +=1
\t\tif attrs.getLength()>0:
`
+
// \t\t\tself.xpath.append(tag + " ["+self.attr2str(attrs)+"]")
`
\t\t\tself.xpath.append(tag + self.attr2str(attrs))
`
+
`
\t\telse:
\t\t\tself.xpath.append(tag)
`
    code.endTag = "\n\n\t"+  "def endElement(self, tag):\n";

    // import
    var imports = `
from cassis import *
import xml.sax
import re
from os import listdir
from os import mkdir
from os.path import exists
`; 
/*
if(this.auto_authentication){
  imports += `
from pycaprio import Pycaprio
from pycaprio.mappings import InceptionFormat, DocumentState
  `;
}
*/

    // Variables globales
    var globales = `
TYPESYS_FILE = 'data/typesystem.xml'
CORPUS_FILE = 'data/`+this.fichierXML+`'
CORPUS_FILES_DIRECTORY = 'data/'
`
/* <LOUIS> */
+
`
file_name_no_extension = re.findall('/([^/]+)\\\\.[^\\\\.]+$',CORPUS_FILE)[0]
`
+
/* </LOUIS> */
`
OUT_DIR = "source/"
`;



// Génération tag et attributs
var defs = "";
var initCounts = "";
this.tagdefDataSource.map(t => {
  initCounts = initCounts+ "\t\tself.openedTag[\""+t.tag+"\"]=0;\n";

    if(t.type==3) {
      var line = "\t\tself.tagAnnos[\""+t.tag+"\"] = type_system.get_type('webanno.custom."+t.tag+"');\n";
      defs = defs + line;
      // Attributs ?
      if(t.attrs==undefined || t.attrs.length==0)
        line = "\t\tself.tagsAttrs[\""+t.tag+"\"] = {}";
      else {
        line = "\t\tself.tagsAttrs[\""+t.tag+"\"] = {";
        for(var a=0; a<t.attrs.length; a+=1) {
          var str = String(t.attrs[a]);
          line = line + "\""+  this.normalizeAttributeName(t.tag, str) + "\" : \""+    t.attrs[a]+"\", "; 
        }
        line = line + "};\n";
        defs = defs + line;
      }

    }
  });
// 
    // Variables de classe
var classe = `
class XML2XMIHandler(xml.sax.ContentHandler):
\tdef __init__(self, type_system, out_dir,ignore_ignorable_whitespace=False):
\t\tself.tagsAttrs = {}
\t\tself.tagAttrLastValues = {}
\t\tself.openedTag = {} ; # to manager possible relative depth constraint for tags
\t\tself.tagAnnos = {}`+"\n"+defs+"\n"+initCounts+`
\t\tself.type_system = type_system
\t\tself.out_dir = out_dir
\t\tself.ignore_whitespace = ignore_ignorable_whitespace or False
\t\tself.doc_count = 0
\t\tself.append_heading = True
\t\t# growing text that is being extracted from the xml for one doc
\t\tself.current_document_text = ''
\t\t# cas data structure that holds the current doc (text and annotations)
\t\tself.current_document_cas = None
\t\tself.anno_begin = {}
\t\tself.current_attributes = None
\t\tself.depth = 0
\t\tself.xpath = []
\t\tself.doc_depth = 0
`;



// Cas des tags extérieurs au documents/topics
this.tagdefDataSource.map(t => {
  if(t.type==5) {
    var test = `
    \t\tif tag == '`+t.tag+`':
    \t\t\treturn`;

    code.startTag = code.startTag + test;
  }
});




   // Cas des tags frontière de documents //

    this.tagdefDataSource.map(t => {

      // <tag>
      
      // Cas d'un tag représentant les frontières de document
      if(t.type==0) {
        var c:boolean = t.constraint=="1" ? true : false;
        var test = '';
        if(c) {
          test = `\t\tif tag == '${t.tag}':
\t\t\tself.openedTag['${t.tag}'] += 1
\t\t\t# case of a document boundary tag, possibly with a depth level constraint
\t\t\tif self.openedTag['${t.tag}'] == 1:
\t\t\t\tself.current_document_cas = Cas(typesystem=self.type_system)
\t\t\t\treturn;
`;
        } else {
          test = `\t\tif tag == '${t.tag}':
\t\t\tself.current_document_cas = Cas(typesystem=self.type_system)
\t\t\tself.current_document_text = ''
\t\t\treturn;
`;
                  
        }
        code.startTag = code.startTag + test;

        if(c) {
          test = `\t\tif tag == '`+t.tag+`':
\t\t\tself.openedTag['`+t.tag+`'] -= 1
`
/* <LOUIS> */
+

`\t\t\tself.depth -=1`
+

/* </LOUIS> */
`
\t\t\t# finish document
\t\t\tif `+(c?'True':'False')+` and self.openedTag['`+t.tag+`'] == 0:
\t\t\t\tself.doc_count += 1
\t\t\t\tself.write_document()
\t\t\t\tself.current_document_text = ''
\t\t\t\tself.current_document_cas = None`
/* <LOUIS> */
+
/*
\t\t\t\tself.depth -=1
ALSO REMOVED TABS AFTERWARDS
*/
/* </LOUIS> */
`
\t\t\tself.xpath.pop()
\t\t\treturn\n\n`;
        } else {
          test = `\t\tif tag == '`+t.tag+`':
\t\t\tif self.current_document_cas != None:
\t\t\t\tself.doc_count += 1
\t\t\t\tself.write_document()
\t\t\t\tself.current_document_text = ''`
/* <LOUIS> */
+
`
\t\t\tself.depth -=1
`
+
/* </LOUIS> */
`
\t\t\tself.xpath.pop()
`
/* <LOUIS> */
+
`
\t\t\tself.current_document_cas = None
\t\t\tself.openedTag['`+t.tag+`'] -= 1
`
+
/* </LOUIS> */
`
\t\t\treturn\n\n`;
        }
        // </tag>
     code.endTag = code.endTag + test;
      }
    }
    );





     // Cas des tags annotation // 
  this.tagdefDataSource.map(t => {

    // <tag>

      if(t.type==3) {
        var test = `\t\t#Case of an annotation
\t\tif tag == "`+t.tag+`":
\t\t\tself.processStartTag(tag, attrs)
\t\t\treturn\n
`;

code.startTag = code.startTag + test;
    
     
      // </tag>
 /*     test = `\t\tif tag == '`+t.tag+`':
\t\t\tself.processEndTag(tag)
\t\t\tself.depth -=1
\t\t\tself.xpath.pop()
\t\t\treturn\n
`;

      code.endTag = code.endTag + test;
*/
      }
    });


    code.endTag = code.endTag + `\t\tif self.current_document_cas != None and tag in self.tagAnnos:
\t\t\tself.processEndTag(tag)
`
/* <LOUIS> */
+
`
\t\tself.depth -=1
`
+
`
\t\tself.xpath.pop()
`;



    var commonMethods = `
\tdef attr2str(self,attrs):
\t\tstr = ""
\t\tfor a in attrs.getNames():
`
/* <LOUIS> */
+
`
\t\t\tstr += " "
`
+
/* </LOUIS> */
`
\t\t\tstr += a;
\t\t\tstr += "=\\"";
\t\t\tstr += attrs.getValue(a);
\t\t\tstr += "\\"";
\t\treturn str;

\tdef processStartTag(self,tag, attrs):
\t\tself.anno_begin[tag+'@'+str(self.depth)] = len(self.current_document_text)
\t\tself.tagAttrLastValues[tag+'@'+str(self.depth)] = attrs

\tdef processEndTag(self,tag):
\t\tanno_end = len(self.current_document_text)
\t\tself.current_document_cas.sofa_string = self.current_document_text
\t\tif self.anno_begin[tag+'@'+str(self.depth)] < anno_end:
\t\t\tself.anno_begin[tag+'@'+str(self.depth)], anno_end = self.trim_whitespace(self.anno_begin[tag+'@'+str(self.depth)], anno_end, self.current_document_text)
\t\tif self.anno_begin[tag+'@'+str(self.depth)] > anno_end:
\t\t\tprint ("ERROR on : " , tag, "begin=", self.anno_begin[tag+'@'+str(self.depth)], "> end=",anno_end )
\t\t\tself.anno_begin[tag+'@'+str(self.depth)] = -1
\t\t\tself.tagAttrLastValues[tag+'@'+str(self.depth)] = None
\t\t\treturn
\t\tanno = self.tagAnnos[tag](begin=self.anno_begin[tag+'@'+str(self.depth)], end=anno_end)
\t\tif tag in self.tagsAttrs:
\t\t\tfor attribute in self.tagsAttrs[tag].keys():
\t\t\t\tif self.tagAttrLastValues[tag+'@'+str(self.depth)]==None or attribute not in self.tagAttrLastValues[tag+'@'+str(self.depth)]:
\t\t\t\t\tcontinue
\t\t\t\tanno.__setattr__(attribute, self.tagAttrLastValues[tag+'@'+str(self.depth)].getValueByQName(attribute))
\t\tself.current_document_cas.add_annotation(anno)
\t\tself.anno_begin[tag+'@'+str(self.depth)] = -1
\t\tself.tagAttrLastValues[tag+'@'+str(self.depth)] = None

\tdef encode_filename(self):
`
+
/* <LOUIS> */
// \t\tfilename = "doc" + str(self.doc_count) + ".xml"
`\t\tfilename = file_name_no_extension + "_doc" + str(self.doc_count) + ".xml"`
+
/* </LOUIS> */
`
\t\treturn filename

\tdef write_document(self):
\t\t"""Write current cas with current text to file with filename """
\t\tif len(self.current_document_text.strip())==0:
\t\t\treturn
\t\tfilename = self.encode_filename()
\t\tself.current_document_cas.sofa_string = self.current_document_text
\t\t#print(filename);
\t\t#print("v=======sofa_string=========================v")
\t\t#print(self.current_document_cas.sofa_string);
\t\t#print("v======current_document_cas.select_all()====v")
\t\t#print(self.current_document_cas.select_all() )
\t\t#print("v======current_document_cas.typecheck=======v")
\t\t#print(self.current_document_cas.typecheck() )
\t\t#print("v======current_document_cas._find_all_fs()===v")
\t\t#for fs in self.current_document_cas._find_all_fs():
\t\t#\tprint(fs )
\t\t#print("=====================================")
\t\tself.current_document_cas.to_xmi(self.out_dir + filename, pretty_print=True)
\t\tprint(f'Wrote doc to file {filename}.')
\t\ttraces = open(self.out_dir + filename+".trace",'w')
\t\ttraces.write(str(self.doc_count) + "\\n" )
\t\tfor t in self.xpath:
\t\t\ttraces.write(t + "\\n")
\t\ttraces.close()
`
// \t\twrite_progress()

+
`
\t\t
\t\tfile = open('status.log','wt',encoding='utf-8')
\t\tfile.write(str(int(100*self.doc_count/` + (~~(this.file_list.length*this.number_of_documents/2)).toString() + `)))
\t\tfile.close()
`
+
`
\tdef trim_whitespace(self, begin, end, text):
\t\t"""move offsets so there is no leading or trailing white-space in the annotation"""
\t\twhitespace = re.compile(r'\\s')
`
+
/* <LOUIS> */
// \t\twhile whitespace.match(text[begin]) and begin+1<len(text):
`\t\twhile begin < end and whitespace.match(text[begin]):`
/* </LOUIS */
+
`
\t\t\tbegin += 1
`
+
/* <LOUIS> */
// \t\twhile whitespace.match(text[end - 1]):
`\t\twhile end > begin and whitespace.match(text[end - 1]):`
+
/* </LOUIS> */
`
\t\t\tend -= 1
\t\treturn begin, end

\tdef characters(self, content):
`
/* <LOUIS> */
+
/*\t\tself.current_document_text += content*/
`
\t\tif self.current_document_cas != None:
\t\t\tself.current_document_text += content
`
+
/* </LOUIS> */
`

\tdef ignorableWhitespace(self, whitespace):
\t\tif self.ignore_whitespace:
\t\t\treturn
\t\tself.current_document_text += whitespace`;


        var main = `\n\n\n
if not exists(OUT_DIR):
\tmkdir(OUT_DIR)


with open(TYPESYS_FILE, 'rb') as f:
\ttype_system = load_typesystem(f)
\tcontentHandler = XML2XMIHandler(type_system, OUT_DIR)
`
+
// \tfiles_handled = 0
`
\tlistdir_CORPUS_FILES_DIRECTORY = listdir(CORPUS_FILES_DIRECTORY)
\tlen_listdir_CORPUS_FILES_DIRECTORY = len(listdir_CORPUS_FILES_DIRECTORY)
\tfor i in listdir_CORPUS_FILES_DIRECTORY:
\t\tif i == 'typesystem.xml' or (not i.endswith('.xml')):
\t\t\tcontinue
\t\txml.sax.parse(CORPUS_FILES_DIRECTORY+i, contentHandler)
`
// \t\tfiles_handled += 1
// \t\tfile = open('status.log','wt',encoding='utf-8')
// \t\tprint(str(int(100*files_handled/(len_listdir_CORPUS_FILES_DIRECTORY/2))))
// \t\tfile.write(str(int(100*files_handled/(len_listdir_CORPUS_FILES_DIRECTORY/2))))
// \t\tfile.close()
// ` 
/*
with open(TYPESYS_FILE, 'rb') as f:
\ttype_system = load_typesystem(f)
\tcontentHandler = XML2XMIHandler(type_system, OUT_DIR)
\txml.sax.parse(CORPUS_FILE, contentHandler)
*/
/*
        var pycaprio_uploading = ``;
        if(this.auto_authentication){
        pycaprio_uploading = `
client = Pycaprio("`+this.inception_url+`",authentication=("`+this.inception_id+`","`+this.inception_password+`"))
new_project = client.api.create_project("`+this.project_name+`",creator_name="`+this.inception_id+`")
for a in listdir('target'):
\tif not a.endswith('.xml'):
\t\tcontinue
\twith open('target/'+a,'rb') as document_file:
\t\tnew_document = client.api.create_document(new_project,a,document_file,document_format=InceptionFormat.UIMA_CAS_XMI_XML_1_1,document_state=DocumentState.NEW) 
`;
        }
*/

let header = "# this Python 3 code has been generated on : " + new Date();

// this.pythonCode = header+imports+ `\nexpected_global_doc_count=` + (~~(this.file_list.length*this.number_of_documents/2)).toString() + `\ndef write_progress():\n\tglobal_doc_count += 1\tfile=open('status.log','wt',encoding='utf-8')\n\tfile.write(str(int(100*global_doc_count/expected_global_doc_count)))\n\tfile.close()\n` + `\nglobal_doc_count=0\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('0')\nfile.close()\n` + globales + classe + code.startTag  + code.endTag + commonMethods  + main + pycaprio_uploading + `\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('100')\nfile.close()`;
// this.pythonCode = header+imports+ `\nexpected_global_doc_count=` + (~~(this.file_list.length*this.number_of_documents/2)).toString() + `\ndef write_progress():\n\tglobal_doc_count += 1\n\tfile=open('status.log','wt',encoding='utf-8')\n\tfile.write(str(int(100*global_doc_count/expected_global_doc_count)))\n\tfile.close()\n` + `\nwrite_progress()\n` + globales + classe + code.startTag  + code.endTag + commonMethods  + main + pycaprio_uploading + `\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('100')\nfile.close()`;
// this.pythonCode = header+imports+ `` + `\nfrom zipfile import ZipFile\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('0')\nfile.close()\n` + globales + classe + code.startTag  + code.endTag + commonMethods  + main + pycaprio_uploading + `\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('100')\nfile.close()\n
this.pythonCode = header+imports+ `` + `\nfrom zipfile import ZipFile\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('0')\nfile.close()\n` + globales + classe + code.startTag  + code.endTag + commonMethods  + main + `\nfile=open('status.log','wt',encoding='utf-8')\nfile.write('100')\nfile.close()\n

#with ZipFile('project_archive.zip','w') as zip:
#\tfor i in listdir(OUT_DIR):
#\t\tif i.endswith('.xml'):
#\t\t\tzip.write(OUT_DIR+i)
#\tzip.write('config.json')
`;

// (~~(this.file_list.length*this.number_of_documents/2)).toString()
  }
























  /*
  switch_to_french(){
    console.log('switching to french');
    // document.getElementById('dx-file-uploader_xml_files').innerHTML = "Charger des fichiers XML";
    this.LANG_dx_file_uploader_xml_files = "Charger des fichiers XML";
    this.LANG_captcha_placeholder = "Réponse au CAPTCHA";
    this.LANG_generate = "Générer";
    this.LANG_caption_quality = "Qualité";
    this.LANG_caption_scale = "Echelle";
    this.LANG_caption_suggestions = "Suggestions";
    this.LANG_caption_choice = "Choix";
    this.LANG_title_converting = "Conversion";
    this.LANG_title_tags = "Balises";
    this.LANG_title_history = "Historique";
    this.LANG_title_help = "Aide";
    try{
      document.getElementById('first_document_span_one').innerHTML = "Premier document (sur ";
      document.getElementById('first_document_span_two').innerHTML = ") :";
      document.getElementById('project_name_span').innerHTML = "Nom du projet :";
    }catch{

    }
  }

  switch_to_english(){
    console.log('switching to english');
    // document.getElementById('dx-file-uploader_xml_files').innerHTML = "Load XML files";
    this.LANG_dx_file_uploader_xml_files = "Load XML files";
    this.LANG_captcha_placeholder = "CAPTCHA answer";
    this.LANG_generate = "Generate";
    this.LANG_caption_quality = "Quality";
    this.LANG_caption_scale = "Scale";
    this.LANG_caption_suggestions = "Suggestions";
    this.LANG_caption_choice = "Choice";
    this.LANG_title_converting = "Converting";
    this.LANG_title_tags = "Tags";
    this.LANG_title_history = "History";
    this.LANG_title_help = "Help";
    try{
      document.getElementById('first_document_span_one').innerHTML = "First document (on ";
      document.getElementById('first_document_span_two').innerHTML = "):";
      document.getElementById('project_name_span').innerHTML = "Project name:";
    }catch{

    }
  }
  */
}


// @NgModule({
//   imports:[
//     DxProgressBarModule
//   ],
//   declarations: [Sax2Component],
//   bootstrap: [Sax2Component],
// })
// export class AppModule { }

// platformBrowserDynamic().bootstrapModule(AppModule);