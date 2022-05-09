/* Elie Naulleau Novembre/Décembre 2021 pour CORLI */

import { Component, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxTabPanelComponent } from 'devextreme-angular';
import { SaxParser } from 'sax-parser';
import { AppInfoService, Tag } from 'src/app/shared/services';
import { saveAs } from 'file-saver';

/*
tuto
https://colab.research.google.com/github/inception-project/inception/blob/master/notebooks/using_pretokenized_and_preannotated_text.ipynb#scrollTo=ejBbdV0GLph6
*/
@Component({
  templateUrl: 'tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})

export class TasksComponent {

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

  parser: SaxParser;


  selectedRange: any = {};
  isSelectionStopped: any;


  tagdefDataSource: any = [];
  tagColors: any = ["#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a", "#cc99ff", "#80e5ff", "#ff9966", "#ffff1a"];


  taginfoPopup: any = {};

  popupSelectVisible: boolean = false;
  popupTagsVisible: boolean = true;

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

  }



  customizeColumns(columns) {
    // columns[0].width = 70;
  }



  onFileUploaderValueChanged(event) {
    // console.log("onFileUploaderValueChanged, event=", event); 
    if (event.value && event.value[0]) {

      let file = event.value[0];

      if (!file) {
        alert("Fichier requis");
        event.cancel = true;
        return;
      }
      this.fichierXML = file.name;
    /*
      let filename = file.name.split('.');
      if (filename.length != 2) {
        console.error("Nom de fichier invalide.");
        alert("Nom de fichier invalide");
        return;
      }
      let name = filename[0];
      let ext = filename[1];
*/

      let reader = new FileReader();
      this.depth = 0;
      reader.onload = () => {
        this.initParser();
        this.parser.parseString(reader.result);
      }

      reader.readAsText(file);
    }
  }



  initParser() {
    let zis = this;
    var contenu = "";
    this.docColumns = ["id"];
    this.parser = new SaxParser(function (cb) {
      var rowid = 0;
      zis.docDataSource = [];
      cb.onStartDocument(function () { });
      cb.onEndDocument(function () { });
      cb.onStartElementNS(function (elem, attrs, prefix, uri, namespaces) {
        // console.log("=> Started: " + elem +      " uri=" +  uri +  " (Attributes: "+   zis.attrToString(attrs)+" )" );

        rowid++;

        //console.log(rowid + " <elem>=" + elem);
        var row: any = {}
        var cname = "P" + zis.depth;

        row.attrsstr = zis.attrToString(attrs);

        if (attrs.length == 0)
          row[cname] = "<" + elem + ">";
        else
          row[cname] = "<" + elem + " " + row.attrsstr + ">";


        row.id = rowid;
        row.elem = elem;
        row.attrs = attrs;


        for (var i = 1; i < zis.depth; i++) {
          row["P" + i] = "";
        }
        zis.docDataSource.push(row);

        if (zis.docColumns.indexOf(cname) == -1) {
          zis.docColumns.push(cname);
        }

        zis.depth = zis.depth + 1;
      });




      cb.onEndElementNS(function (elem, prefix, uri) {
        //    console.log("<= End: " + elem + " uri=" + uri + "\n");

        rowid++;
        zis.depth = zis.depth - 1;

        var row: any = {}
        row["P" + zis.depth] = "</" + elem + ">";
        row.id = rowid;
        row.elem = elem;
        for (var i = 1; i < zis.depth; i++) {
          row["P" + i] = "";
        }
        zis.docDataSource.push(row);
        var previous = rowid > 1 ? zis.docDataSource[rowid - 2] : "";

        zis.docContentMap[rowid] = contenu;
        var previoustag = previous["P" + zis.depth];
        if (previous && previoustag && previoustag.substring(0, elem.length + 1) == "<" + elem) {
          zis.docContentMap[rowid - 1] = contenu;
        }
      });


      cb.onCharacters(function (chars) {
        //  console.log("<CHARS>" + chars + "</CHARS>");
        contenu = chars;
      });
      cb.onCdata(function (cdata) {
        // console.log("<CDATA>" + cdata + "</CDATA>");
      });
      cb.onComment(function (msg) {
        //console.log("<COMMENT>" + msg + "</COMMENT>");
      });
      cb.onWarning(function (msg) {
        console.log("<WARNING>" + msg + "</WARNING>");

      });
      cb.onError(function (msg) {
        console.log("<ERROR>" + rowid + " " + JSON.stringify(msg) + "</ERROR>");
        alert("<ERROR>" + rowid + " " + JSON.stringify(msg) + "</ERROR>");
      });
    });
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

  onToolbarPreparing(e) {
    var toolbarItems = e.toolbarOptions.items;


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
    console.log(e);
    if (e.data.tag in this.docTagMap) {
      this.docTagMap[this.lastSelectedTag] = e.data.color;
      this.xmlGrid.instance.refresh();
    }
  }


  attrToString(attrs) {
    var str = ""
    for (var i = 0; i < attrs.length; i++) {
      str = str + attrs[i][0] + "=\"" + attrs[i][1] + "\" ";
    }
    return str;
  }

  recupAttrNames(attrs) {
    var anames = [];
    if(attrs==null || attrs.length==0) return anames;
    for (var a of attrs) {
      anames.push(a[0]);
    }
    return anames;
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
            type: count<2 ? 0 : 3,
            color: colour,
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
      }

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
    console.log("typeDescriptionGenerator for: "+ name);
    console.log(attrs);
    var description = "\n\n<typeDescription>" + "\n";
    description = description + "<name>webanno.custom." + name + "</name>" + "\n";
    description = description + "<description/>" + "\n";
    description = description + "<supertypeName>uima.tcas.Annotation</supertypeName>" + "\n";
    description = description + "<features>" + "\n";
    if(attrs && attrs.length>0)
    attrs.map(e => {
      console.log("<name>" + e + "</name>");
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
  }


  downloadTypesystem() {
    var blob = new Blob([this.typesystem], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "typesystem.xml");
  }


  generatePythonParser() {

    var finishedTopicTestPassed = false;

    var code: any = {};
    code.startTag = `
\tdef startElement(self, tag, attrs):
\t\tself.depth +=1
\t\tif attrs.getLength()>0:
\t\t\tself.xpath.append(tag + " ["+self.attr2str(attrs)+"]")
\t\telse:
\t\t\tself.xpath.append(tag)
`
    code.endTag = "\n\n\t"+  "def endElement(self, tag):\n";

    // import
    var imports = `
from cassis import *
import xml.sax
import re
`;

    // Variables globales
    var globales = `
TYPESYS_FILE = 'data/typesystem.xml'
CORPUS_FILE = 'data/`+this.fichierXML+`'
OUT_DIR = "target/"
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
\t\t\treturn;
`;
                  
        }
        code.startTag = code.startTag + test;

        if(c) {
          test = `\t\tif tag == '`+t.tag+`':
\t\t\tself.openedTag['`+t.tag+`'] -= 1
\t\t\t# finish document
\t\t\tif `+(c?'True':'False')+` and self.openedTag['`+t.tag+`'] == 0:
\t\t\t\tself.doc_count += 1
\t\t\t\tself.write_document()
\t\t\t\tself.current_document_text = ''
\t\t\t\tself.depth -=1
\t\t\t\tself.xpath.pop()
\t\t\t\treturn\n\n`;
        } else {
          test = `\t\tif tag == '`+t.tag+`':
\t\t\tself.openedTag['`+t.tag+`'] -= 1
\t\t\tself.doc_count += 1
\t\t\tself.write_document()
\t\t\tself.current_document_text = ''
\t\t\tself.depth -=1
\t\t\tself.xpath.pop()
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
\t\tself.depth -=1
\t\tself.xpath.pop()
`;



    var commonMethods = `
\tdef attr2str(self,attrs):
\t\tstr = ""
\t\tfor a in attrs.getNames():
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
\t\tfilename = "doc" + str(self.doc_count) + ".xml"
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

\tdef trim_whitespace(self, begin, end, text):
\t\t"""move offsets so there is no leading or trailing white-space in the annotation"""
\t\twhitespace = re.compile(r'\\s')
\t\twhile whitespace.match(text[begin]) and begin+1<len(text):
\t\t\tbegin += 1
\t\twhile whitespace.match(text[end - 1]):
\t\t\tend -= 1
\t\treturn begin, end

\tdef characters(self, content):
\t\tself.current_document_text += content

\tdef ignorableWhitespace(self, whitespace):
\t\tif self.ignore_whitespace:
\t\t\treturn
\t\tself.current_document_text += whitespace`;


        var main = `\n\n\nwith open(TYPESYS_FILE, 'rb') as f:
        type_system = load_typesystem(f)
        contentHandler = XML2XMIHandler(type_system, OUT_DIR)
        xml.sax.parse(CORPUS_FILE, contentHandler)
        
        ` 

let header = "# this Python 3 code has been generated on : " + new Date();

this.pythonCode = header+imports + globales + classe + code.startTag  + code.endTag + commonMethods  + main;

  }
}
