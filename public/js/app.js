const API_ENDPOINT = 'https://papermaker.labs.zikani.me/api/v1/generate'
// const API_ENDPOINT = 'http://localhost:7765/api/v1/generate'

const QUESTION_TYPE = {
    MULTIPLE_CHOICE: 1,
    FREEFORM: 2,
    LABEL_DIAGRAM: 3
  };
  
  let Question = function(titleText, questionType, options = {}) {
    this.title = titleText;
    this.content = content;
    this. questionType = questionType;
    // question belongs to specific section
    if (options.section) {
      this.sectionID = options.section
    }
    if (this.questionType === QUESTION_TYPE.MULTIPLE_CHOICE) {
      this.answerOptions = options.answerOptions || []
    }
    if (this.questionType === QUESTION_TYPE.FREEFORM) {
      this.lineOptions = options.lines || 3
    }
  }
  
  
  let app = Vue.createApp({
    template: document.getElementById('app-template').innerHTML,
    components: {
      // "NewQuestionComponent": NewQuestionComponent,
    },
    data() {
      return {
        appTitle: 'Paper Maker App',
        activeTabName: 'newPaperTab',
        title: '',
        classTerm: '',
        className: '',
        schoolName: '',
        subjectName: '',
        selectedExamType: null,
        selectedExamTypeModel: '',
        outputFormat: "docx",
        examDate: '',
        timeAllowed: '',
        teacherName: '',
        questions: [],
        sections: [],
        columnCount: 1,
        currentQuestionIdx: -1,
        // transient variable to store in process question.
        newSection: {
          id: '',
          name: '',
          displaySectionName: true,
        },
        newQuestion: {
          id: '',
          title: '',
          content: '',
          isMultipleChoice: false,
          answerOptions: [],
        },
        downloadedData: null,
        outputName: '',        
        // UI stuff
        isEditingQuestion: false,
        isEditingSection: false,
        hasMultipleSections: false,
        generating: false,
        paperGenerated: false,
        isWasmModuleLoaded: false,
        examTypeColumns: [
          // { value: "mixed", text: "Mixed (Multiple Choice and Freeform)" },
          // { value: "multiple_choice", text: "Multiple Choice" },
          { value: "free_form", text: "Free Form" },
        ],
        showExamOptionsPicker: false,
        uncollapsedQuestions: [],
        uncollaps: [],
      }
    },
  
    computed: {

      computedTitle() {
        if (this.title.length > 0) {
          return this.title
        }
        return `${this.subjectName} - ${this.classTerm}`
      },

      isMultipleChoiceSupported() {
        return this.selectedExamType && (this.selectedExamType.value == 'multiple_choice' || this.selectedExamType.value == 'mixed');
      },

      hasSections() {
        return this.sections.length > 0;
      },

      availableSections() {
        return [];//TODO: SECTIONS
      },
      noOfQuestions() {
        return  this.questions ? this.questions.length : 0;
      },
  
      nextQuestionIdx() {
        if (this.currentQuestionIdx == -1) {
          return 0
        }
        if ((this.currentQuestionIdx + 1 ) > this.questions.length - 1) {
          return questions.length
        }
        return this.currentQuestionIdx + 1;
      },
      
      paperFilename() {
        let normalizedTitle = `${this.subjectName} - ${this.classTerm}`
        normalizedTitle = normalizedTitle.replace('\s\\\\//\*!#$%', '')
        return `${normalizedTitle} [Generated by Paper Maker App labs.zikani.me].${this.outputFormat}`
      },

      downloadedDataBase64URL() {
        return this.downloadedData;
      }
    },
  
    methods: {      

      resetNewQuestion() {
        this.newQuestion = {
          id: '',
          title: '',
          content: 'Type the question here',
          isMultipleChoice: false,
          answerOptions: [],
        }
      },

      prevQuestion() {
        if (this.currentQuestionIdx > 0) {
          this.currentQuestionIdx -= 1
        }
      },
  
      nextQuestion() {
        this.currentQuestionIdx += 1
        if (this.currentQuestionIdx > this.questions.length - 1) {
          this.currentQuestionIdx = questions.length - 1;
        }
      },

      onExamOptionSelected(selectedItem) {
        this.selectedExamType = selectedItem
        this.showExamOptionsPicker = false
      },

      saveOrEditSection(event) {
        let sectionData = Object.assign({}, this.newSection, { id: this.sections.length + 1 })
        this.sections.push(sectionData)
        this.isEditingSection = false
      },

      saveOrEditQuestion(event) {
        if (this.newQuestion.content.length < 1) {
          return;
        }
        let questionData = Object.assign({}, this.newQuestion)
        // TODO: handle answer options for multiple choice
        this.questions.push(questionData)
        this.resetNewQuestion()
        this.isEditingQuestion = false
      },
  
      submitGenerate(event) {
        event.preventDefault()
  
        const data = {
          outputFormat: this.outputFormat,
          title: this.computedTitle,
          className: this.className,
          schoolName: this.schoolName,
          teacherName: this.teacherName,
          subjectName: this.subjectName,
          isDoubleColumn: this.isDoubleColumn,
          timeAllowed: this.timeAllowed,
          examDate: this.examDate,
          questions: this.questions.map((q, idx) => {
            return {
              sortOrder: idx + 1,

              section: q.section,
              title: q.title,
              content: q.content,
              questionType:  q.questionType,

              answerOptions: q.answerOptions.map(opt => {
                return {
                  content: opt.content,
                  isCorrect: opt.isCorrect,
                }
              }),
              
              image: {
                url: "",
                width: "",
                height: "",
                alt: "Figure 1"
              }
            }
          }),
          font: {
            name: this.fontName,
            size: this.fontSize,
            file: "", // TODO
          },
        }
  
        this.generating = true;
        this.paperGenerated = false;

        _generatePaper(data, this.outputFormat)
        .then(paperBase64Encoded => {
          this.downloadedData = paperBase64Encoded
          this.paperGenerated = true;
          this.generating = false;
          setTimeout(() => this.$refs.downloadEl.click(), 300)
          vant.Notify({ type: 'success', message: 'Process completed sucessfully, download will start automatically...' });
        })
        .catch(err => {
          if (err['data']) {
            let data = err['data'];
            let errors  = data['validationErrors'] || ['unknown errors'];

            vant.Notify({ 
              type: 'warning', 
              message: '⚠️ Validation errors: ' + errors.join('× ') 
            });
            return;
          }

          vant.Notify({ 
            type: 'warning', 
            message: 'Failed to process request. error: ' + err 
          });
        })

        return false;
      }
    }
  
  })

  app.use(vant);
  
  // Register Lazyload directive
  app.use(vant.Lazyload);
  
function _generatePaper(data, outputFormat) {
  if (window._wasmModuleLoaded) {
    let result = GeneratePaper(JSON.stringify(data), outputFormat)
    if (result.indexOf('base64') > 0) {
      return Promise.resolve(result)
    }
    let err = new Error('Failed to process request: ' + result)
    if (result.indexOf('validationErrors') > 0) {
      err.data = JSON.parse(result)
    }
    return Promise.reject(err)
    // return Promise.reject(JSON.parse(result))
  }
  return fallbackAPIBackedGeneratePaper(data, outputFormat)
}

function fallbackAPIBackedGeneratePaper(data, outputFormat)  {
  return fetch(API_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    .then(response => {
      if (response.ok) {
        return response.text()
      }
      return response.text().then(txt => {
        let err = new Error('Failed to process request')
        if (txt.indexOf('validationErrors') > 0) {
          err.data = JSON.parse(txt)
        }
        return Promise.reject(err)
      })
    })
}

window._wasmModuleLoaded = false;
let mountedApp = app.mount(document.getElementById('app'))

fetch("main.wasm").then(wasmModule => {
  const go = new Go();
  WebAssembly.instantiateStreaming(wasmModule, go.importObject)
    .then((result) => {
      window._wasmModuleLoaded = true;
      mountedApp.isWasmModuleLoaded = true;
      // vant.Notify({ type: 'success', message: 'Loaded resources for Offline functionality... You can use the app offline' });
      go.run(result.instance);
    })
    .catch(err => {
      vant.Notify({ type: 'warning', message: 'Failed to load resources for Offline functionality. You can still use the app but will need an internet connection. Try to reload the page' });
      console.error("Failed to load WASM module, try to reload the page... will use online API to process requests")
      window._wasmModuleLoaded = false;
      mountedApp.isWasmModuleLoaded = false;
    })
})



