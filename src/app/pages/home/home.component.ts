import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: [ './home.component.scss' ]
})

// export class HomeComponent implements OnInit {
export class HomeComponent {
  constructor() {}

  // ngOnInit(): void {
      
  // }

  switch_to_french(){
    console.log('switching to french');
    document.getElementById('home_main_div').innerHTML = "<p>Cet utilitaire est un prototype qui doit permettre de préparer des documents XML pour être importés dans l'outil <a target=\"_blank\" href=\"https://inception-project.github.io/\">INCEpTION</a>. Ceci implique de transformer vos données dans le format UIMA CAS XMI avec un seul document par fichier (split).</p><b>Marche à suivre : </b><ol><li>Dans l'onglet \"Conversion\", chargez vos fichiers XML (TEI par exemple), puis identifiez :</li><ol><li><b>La balise qui permet de distinguer chaque document du corpus</b> (<i>l'application vous fera des suggestions, mais vous pouvez mettre ce que vous souhaitez</i>)</li><li>[optionnel] la balise qui représente la notion de paragraphe</li><li>[optionnel] la balise qui représente la notion de phrase</li><li>les annotations pré-éxistantes qui vous souhaitez retrouver dans INCEpTION (<i>par défaut, toutes les balises qui ne font pas partie des autres catégories sont considérées comme des annotations</i>)</li></ol><li>[optionnel] Sélectionnez un nom de projet.</li><li>Cliquez sur <b>GENERER</b> et patientez jusqu'à ce que votre corpus converti soit téléchargé automatiquement sous la forme d'un fichier ZIP. <b>Vous n'avez pas besoin de décompresser ce fichier, il pourra directement être chargé dans INCEpTION.</b></li><li>Dans l'onglet \"Projects\" d'INCEpTION, cliquez sur \"Import project\" et sélectionnez le fichier ZIP.</li></ol><p>Veuillez noter que cet outil a été testé sur INCEpTION 23.4. Au besoin, veuillez contacter <a href=\"https://corli.huma-num.fr/en/contact-2/\">CORLI</a> ou me contacter directement <a href=\"https://github.com/LouisEsteve/inception_converter_applet\">sur GitHub</a>. Ceci étant un prototype, nous sommes aussi ouverts aux retours.</p>";
    document.getElementById('home_h2').innerHTML = "Accueil";
  }

  switch_to_english(){
    console.log('switching to english');
    document.getElementById('home_main_div').innerHTML = "<p>This applet is a prototype which allows to prepare XML documents to be imported into the tool named <a target=\"_blank\" href=\"https://inception-project.github.io/\">INCEpTION</a>. This means it will transform your data into the UIMA CAS XMI format with one document per file (splitting).</p><b>Steps to follow: </b><ol><li>In the \"Converting\" tab, load your XML files (TEI for example), then identify:</li><ol><li><b>The tag that allows for distinguishing each document within the corpus</b> (<i>the app will give you suggestions, but you can use whichever tag you prefer</i>)</li><li>[optional] the tag that represents the idea of paragraph</li><li>[optional] the tag that represents the idea of sentence</li><li>pre-existing annotations that you wish to keep in INCEpTION (<i>by default, all tags that are not part of other categories are considered to be annotations</i>)</li></ol><li>[optional] Select a project name.</li><li>Clic on <b>GENERATE</b> and wait until your converted corpus is automatically downloaded as a ZIP file. <b>You don't need to decompress this file, it is to be directly uploaded into INCEpTION.</b></li><li>In the \"Projects\" tab of INCEpTION, clic on \"Import project\" and select the ZIP file.</li></ol><p>Please note that this tool has been tested on INCEpTION 23.4. If needed, you may contact us at <a href=\"https://corli.huma-num.fr/en/contact-2/\">CORLI</a> or directly <a href=\"https://github.com/LouisEsteve/inception_converter_applet\">on GitHub</a>. As this tool is a prototype, we are open to feedbacks.</p>";
    document.getElementById('home_h2').innerHTML = "Home";
  }
}
