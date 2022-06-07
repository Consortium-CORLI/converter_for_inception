import { Component, OnInit } from '@angular/core';
// import * as frMessages from "fr.json";
// import enMessages from "devextreme/localization/messages/en.json";
// import deMessages from "devextreme/localization/messages/de.json";
// import * as deMessages from "devextreme/localization/messages/de.json";
// import deMessages from "devextreme/localization/messages/de.json";
// import ruMessages from "devextreme/localization/messages/ru.json";
import { locale, loadMessages, formatMessage } from "devextreme/localization";

@Component({
  templateUrl: 'home.component.html',
  styleUrls: [ './home.component.scss' ]
})

// export class HomeComponent implements OnInit {
export class HomeComponent {
  constructor() {
    // loadMessages(frMessages);
    // loadMessages(enMessages);
    
    loadMessages({
      "fr": {
        "test": "test français",

        "custom_home": "Accueil",
        "custom_steps_to_follow": "Marche à suivre",
        "custom_this_applet_is_a_prototype": "Cet utilitaire est un prototype qui doit permettre de préparer des documents XML pour être importés dans l'outil",
        "custom_this_means_it_will_transform": "Ceci implique de transformer vos données dans le format UIMA CAS XMI avec un seul document par fichier (split).",
        "custom_in_the_converting_tab": "Dans l'onglet \"Conversion\", chargez vos fichiers XML (TEI par exemple), puis identifiez :",
        "custom_the_tag_that_allows": "La balise qui permet de distinguer chaque document du corpus",
        "custom_the_app_will_give_you_suggestions": "l'application vous fera des suggestions, mais vous pouvez mettre ce que vous souhaitez",
        "custom_paragraph_tag": "[optionnel] la balise qui représente la notion de paragraphe",
        "custom_sentence_tag": "[optionnel] la balise qui représente la notion de phrase",
        "custom_preexisting_annotations": "les annotations pré-éxistantes qui vous souhaitez retrouver dans INCEpTION",
        "custom_default_tag": "par défaut, toutes les balises qui ne font pas partie des autres catégories sont considérées comme des annotations",
        "custom_select_project_name": "[optionnel] Sélectionnez un nom de projet.",
        "custom_click_on": "Cliquez sur ",
        "custom_generate": "GENERER",
        "custom_and_wait": "et patientez jusqu'à ce que votre corpus converti soit téléchargé automatiquement sous la forme d'un fichier ZIP.",
        "custom_no_need_to_decompress": "Vous n'avez pas besoin de décompresser ce fichier, il pourra directement être chargé dans INCEpTION.",
        "custom_import_inception": "Dans l'onglet \"Projects\" d'INCEpTION, cliquez sur \"Import project\" et sélectionnez le fichier ZIP.",
        "custom_please_note": "Veuillez noter que cet outil a été testé sur INCEpTION 23.4. Au besoin, veuillez contacter",
        "custom_or_directly": "ou directement",
        "custom_on_github": "sur GitHub",
        "custom_as_this_tool_is_prototype": "Ceci étant un prototype, nous sommes aussi ouverts aux retours.",

        // "custom_presentation_sentence1": "Cet utilitaire est un prototype qui doit permettre de préparer des documents XML pour être importés dans l'outil <a target=\"_blank\" href=\"https://inception-project.github.io/\">INCEpTION</a>. Ceci implique de transformer vos données dans le format UIMA CAS XMI avec un seul document par fichier (split).",
        "custom_load_xml_files": "Charger des fichiers XML",
        "custom_conversion": "Conversion",
        "custom_tags": "Balises",
        "custom_history": "Historique",
        "custom_help": "Aide",
        "custom_tag": "Balise",
        "custom_attributes": "Attributs",
        "custom_constraint": "Contrainte",
        "custom_type": "Type",
        "custom_quantity": "Quantité",
        "custom_average_length": "Longueur moyenne",
        "custom_index": "Indice",
        "custom_project_name": "Nom du projet",
        "custom_document_separator": "Séparateur de document",
        "custom_date": "Date",
        "custom_file_names": "Noms des fichiers",
        "custom_load_your_documents": "Chargez vos documents",
        "custom_click_on_pen": "Cliquez sur le crayon pour modifier la balise séparatrice de documents",
        "custom_fill_document_separator": "Renseignez la balise séparatrice et cliquez sur \"Sauvegarder\"",
        "custom_fill_captcha": "Remplissez le CAPTCHA",
        "custom_modify_project_name": "Modifiez le nom du projet si vous le souhaitez, cliquez sur \"GENERER\" et patientez jusqu'à ce que votre corpus converti soit téléchargé automatiquement",
        "custom_inception_import": "Une fois dans INCEpTION, dans l'onglet \"Projects\", importez le fichier téléchargé en cliquant sur \"Import project\"",
        "dxDataGrid-noDataText": "Pas de données",
        "dxDataGrid-editingSaveRowChanges": "Sauvegarder"
      },
      "en": {
        "test": "test english",

        "custom_home": "Home",
        "custom_steps_to_follow": "Steps to follow",
        "custom_this_applet_is_a_prototype": "This applet is a prototype which allows to prepare XML documents to be imported into the tool named",
        "custom_this_means_it_will_transform": "This means it will transform your data into the UIMA CAS XMI format with one document per file (splitting).",
        "custom_in_the_converting_tab": "In the \"Converting\" tab, load your XML files (TEI for example), then identify:",
        "custom_the_tag_that_allows": "The tag that allows the distinction of each document within the corpus",
        "custom_the_app_will_give_you_suggestions": "the app will give you suggestions, but you can use whichever tag you prefer",
        "custom_paragraph_tag": "[optional] the tag that represents the idea of paragraph",
        "custom_sentence_tag": "[optional] the tag that represents the idea of sentence",
        "custom_preexisting_annotations": "pre-existing annotations that you wish to keep in INCEpTION",
        "custom_default_tag": "by default, all tags that are not part of other categories are considered to be annotations",
        "custom_select_project_name": "[optional] Select a project name.",
        "custom_click_on": "Click on ",
        "custom_generate": "GENERATE",
        "custom_and_wait": "and wait until your converted corpus is automatically downloaded as a ZIP file.",
        "custom_no_need_to_decompress": "You don't need to decompress this file, it is to be directly uploaded into INCEpTION.",
        "custom_import_inception": "In the \"Projects\" tab of INCEpTION, click on \"Import project\" and select the ZIP file.",
        "custom_please_note": "Please note that this tool has been tested on INCEpTION 23.4. If needed, you may contact us at",
        "custom_or_directly": "or directly",
        "custom_on_github": "on GitHub",
        "custom_as_this_tool_is_prototype": "As this tool is a prototype, we are open to feedbacks.",

        "custom_load_xml_files": "Load XML files",
        "custom_conversion": "Converting",
        "custom_tags": "Tags",
        "custom_history": "History",
        "custom_help": "Help",
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
        "custom_load_your_documents": "Load your documents",
        "custom_click_on_pen": "Click on the pen to modify the document-separating tag",
        "custom_fill_document_separator": "Fill in the document-separating tag and click on \"Save\"",
        "custom_fill_captcha": "Fill in the CAPTCHA",
        "custom_modify_project_name": "Modify the project name if you wish to, click on \"Generate\" and wait until your converted corpus is downloaded automatically",
        "custom_inception_import": "Once in INCEpTION, in the \"Projects\" tab, import the downloaded file by clicking on \"Import project\"",
        "dxDataGrid-noDataText": "No data",
        "dxDataGrid-editingSaveRowChanges": "Save"
      }
    });
    
    locale(navigator.language);
    // locale('en');
  }

  get test(){
    return formatMessage("test");
  }
  get custom_home(){return formatMessage("custom_home")};
  get custom_this_applet_is_a_prototype(){return formatMessage("custom_this_applet_is_a_prototype")};
  get custom_this_means_it_will_transform(){return formatMessage("custom_this_means_it_will_transform")};
  get custom_steps_to_follow(){return formatMessage("custom_steps_to_follow")};
  get custom_in_the_converting_tab(){return formatMessage("custom_in_the_converting_tab")};
  get custom_the_tag_that_allows(){return formatMessage("custom_the_tag_that_allows")};
  get custom_the_app_will_give_you_suggestions(){return formatMessage("custom_the_app_will_give_you_suggestions")};
  get custom_paragraph_tag(){return formatMessage("custom_paragraph_tag")};
  get custom_sentence_tag(){return formatMessage("custom_sentence_tag")};
  get custom_preexisting_annotations(){return formatMessage("custom_preexisting_annotations")};
  get custom_default_tag(){return formatMessage("custom_default_tag")};
  get custom_select_project_name(){return formatMessage("custom_select_project_name")};
  get custom_click_on(){return formatMessage("custom_click_on")};
  get custom_generate(){return formatMessage("custom_generate")};
  get custom_and_wait(){return formatMessage("custom_and_wait")};
  get custom_no_need_to_decompress(){return formatMessage("custom_no_need_to_decompress")};
  get custom_import_inception(){return formatMessage("custom_import_inception")};
  get custom_please_note(){return formatMessage("custom_please_note")};
  get custom_or_directly(){return formatMessage("custom_or_directly")};
  get custom_on_github(){return formatMessage("custom_on_github")};
  get custom_as_this_tool_is_prototype(){return formatMessage("custom_as_this_tool_is_prototype")};

  // ngOnInit(): void {
      
  // }

  switch_to_french(){
    console.log('switching to french');
    document.getElementById('home_main_div').innerHTML = "<p>Cet utilitaire est un prototype qui doit permettre de préparer des documents XML pour être importés dans l'outil <a target=\"_blank\" href=\"https://inception-project.github.io/\">INCEpTION</a>. Ceci implique de transformer vos données dans le format UIMA CAS XMI avec un seul document par fichier (split).</p><b>Marche à suivre : </b><ol><li>Dans l'onglet \"Conversion\", chargez vos fichiers XML (TEI par exemple), puis identifiez :</li><ol><li><b>La balise qui permet de distinguer chaque document du corpus</b> (<i>l'application vous fera des suggestions, mais vous pouvez mettre ce que vous souhaitez</i>)</li><li>[optionnel] la balise qui représente la notion de paragraphe</li><li>[optionnel] la balise qui représente la notion de phrase</li><li>les annotations pré-éxistantes qui vous souhaitez retrouver dans INCEpTION (<i>par défaut, toutes les balises qui ne font pas partie des autres catégories sont considérées comme des annotations</i>)</li></ol><li>[optionnel] Sélectionnez un nom de projet.</li><li>Cliquez sur <b>GENERER</b> et patientez jusqu'à ce que votre corpus converti soit téléchargé automatiquement sous la forme d'un fichier ZIP. <b>Vous n'avez pas besoin de décompresser ce fichier, il pourra directement être chargé dans INCEpTION.</b></li><li>Dans l'onglet \"Projects\" d'INCEpTION, cliquez sur \"Import project\" et sélectionnez le fichier ZIP.</li></ol><p>Veuillez noter que cet outil a été testé sur INCEpTION 23.4. Au besoin, veuillez contacter <a href=\"https://corli.huma-num.fr/en/contact-2/\">CORLI</a> ou me contacter directement <a href=\"https://github.com/LouisEsteve/inception_converter_applet\">sur GitHub</a>. Ceci étant un prototype, nous sommes aussi ouverts aux retours.</p>";
    document.getElementById('home_h2').innerHTML = "Accueil";
  }

  switch_to_english(){
    console.log('switching to english');
    document.getElementById('home_main_div').innerHTML = "<p>This applet is a prototype which allows to prepare XML documents to be imported into the tool named <a target=\"_blank\" href=\"https://inception-project.github.io/\">INCEpTION</a>. This means it will transform your data into the UIMA CAS XMI format with one document per file (splitting).</p><b>Steps to follow: </b><ol><li>In the \"Converting\" tab, load your XML files (TEI for example), then identify:</li><ol><li><b>The tag that allows the distinction of each document within the corpus</b> (<i>the app will give you suggestions, but you can use whichever tag you prefer</i>)</li><li>[optional] the tag that represents the idea of paragraph</li><li>[optional] the tag that represents the idea of sentence</li><li>pre-existing annotations that you wish to keep in INCEpTION (<i>by default, all tags that are not part of other categories are considered to be annotations</i>)</li></ol><li>[optional] Select a project name.</li><li>Click on <b>GENERATE</b> and wait until your converted corpus is automatically downloaded as a ZIP file. <b>You don't need to decompress this file, it is to be directly uploaded into INCEpTION.</b></li><li>In the \"Projects\" tab of INCEpTION, click on \"Import project\" and select the ZIP file.</li></ol><p>Please note that this tool has been tested on INCEpTION 23.4. If needed, you may contact us at <a href=\"https://corli.huma-num.fr/en/contact-2/\">CORLI</a> or directly <a href=\"https://github.com/LouisEsteve/inception_converter_applet\">on GitHub</a>. As this tool is a prototype, we are open to feedbacks.</p>";
    document.getElementById('home_h2').innerHTML = "Home";
  }
}
