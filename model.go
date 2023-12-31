package papermaker

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"

	docx "github.com/fumiama/go-docx"
)

type EducationLevel string

const (
	Standard1 EducationLevel = "Standard 1"
	Standard2 EducationLevel = "Standard 2"
	Standard3 EducationLevel = "Standard 3"
	Standard4 EducationLevel = "Standard 4"
	Standard5 EducationLevel = "Standard 5"
	Standard6 EducationLevel = "Standard 6"
	Standard7 EducationLevel = "Standard 7"
	Standard8 EducationLevel = "Standard 8"
	Form1     EducationLevel = "Form 1"
	Form2     EducationLevel = "Form 2"
	Form3     EducationLevel = "Form 3"
	Form4     EducationLevel = "Form 4"
	Form5     EducationLevel = "Form 5"
	ALevels   EducationLevel = "A-Levels"
)

const MaxFreeFormLines = 4

type ExamPaper struct {
	Title          string         `json:"title"`
	ClassName      EducationLevel `json:"className"`
	SchoolName     string         `json:"schoolName"`
	TeacherName    string         `json:"teacherName"`
	SubjectName    string         `json:"subjectName"`
	TimeAllowed    string         `json:"timeAllowed"`
	ExamDate       string         `json:"examDate"` // TODO: use time.Time
	IsDoubleColumn bool           `json:"isDoubleColumn"`
	Questions      []ExamQuestion `json:"questions"`
}

type ValidationErrors []string

func (v ValidationErrors) ToJSON() string {
	data := map[string]any{
		"validationErrors": v,
	}
	b, _ := json.Marshal(data)
	return string(b)
}

func (p *ExamPaper) Validate() ValidationErrors {
	errs := make(ValidationErrors, 0)
	if p.Title == "" {
		errs = append(errs, "error: Title cannot be empty")
	}
	if p.ClassName == "" {
		errs = append(errs, "error: ClassLevel cannot be empty")
	}
	if p.SchoolName == "" {
		errs = append(errs, "error: SchoolName cannot be empty")
	}
	if p.TeacherName == "" {
		errs = append(errs, "error: TeacherName cannot be empty")
	}
	if p.SubjectName == "" {
		errs = append(errs, "error: SubjectName cannot be empty")
	}
	if p.TimeAllowed == "" {
		errs = append(errs, "error: TimeAllowed cannot be empty")
	}
	if p.ExamDate == "" {
		errs = append(errs, "error: ExamDate cannot be empty")
	}
	if len(p.Questions) < 1 {
		errs = append(errs, "error: Questions cannot be empty")
	}

	// TODO: implement better validation rules for time, format etc..

	if len(errs) < 1 {
		return nil
	}

	return errs
}

// TotalMarks calculates the total marks for the Questions
func (p *ExamPaper) TotalMarks() int {
	totalMarks := 0
	for _, q := range p.Questions {
		totalMarks += q.Marks
	}
	return totalMarks
}

// WriteDocx writes the paper as a Docx to an io.Writer
func (p *ExamPaper) WriteDocx(w io.Writer) error {
	docxw := docx.NewA4()
	para := docxw.AddParagraph()
	para.AddText(strings.ToUpper(p.SchoolName)).Size("18")

	para = docxw.AddParagraph()
	para.AddText(strings.ToUpper(p.Title)).Size("14")

	para = docxw.AddParagraph()
	para.AddText(p.SubjectName).Size("14")

	para = docxw.AddParagraph()
	para.AddText(string(p.ClassName)).Size("12")

	para = docxw.AddParagraph()
	para.AddText(p.TeacherName).Size("12")

	para = docxw.AddParagraph()
	para.AddText(fmt.Sprintf("DATE: %s\t\t TIME ALLOWED: %s", p.ExamDate, p.TimeAllowed)).Size("12")

	for _, question := range p.Questions {
		question.WriteDocx(docxw)
	}

	_, err := docxw.WriteTo(w)
	return err
}

const (
	FreeFormQuestion        = "free_form"
	LabelTheDiagramQuestion = "label-the-diagram"
	MathematicalQuestion    = "math"
	MultipleChoiceQuestion  = "multiple_choice"
	MixedQuestion           = "mixed"
)

type MultipleChoiceOption struct {
	Content   string `json:"content"`
	IsCorrect bool   `json:"isCorrect"`
}

type ExamQuestion struct {
	Section       string                 `json:"section"`
	Title         string                 `json:"title"`
	Content       string                 `json:"content"`
	QuestionType  string                 `json:"questionType"`
	AnswerOptions []MultipleChoiceOption `json:"answerOptions"`
	SortOrder     int                    `json:"sortOrder"`
	Marks         int                    `json:"marks"`
	Image         ImageInfo              `json:"-"`
}

func (q *ExamQuestion) WriteDocx(docxw *docx.Docx) error {
	qpara := docxw.AddParagraph()
	qpara.AddText(fmt.Sprintf("%d. %s", q.SortOrder, q.Content)).Size("12")

	// TODO: Add condition block for the other type type of questions
	if q.QuestionType == MultipleChoiceQuestion {
		for idx, answers := range q.AnswerOptions {
			qapara := docxw.AddParagraph()
			qapara.AddText(fmt.Sprintf("%s ) \t %s", string("ABCDEFGHI"[idx]), answers.Content))
		}
	} else {
		for i := 0; i < MaxFreeFormLines; i++ {
			qapara := docxw.AddParagraph()
			qapara.AddText("__________________________________________________________________")
		}
	}

	return nil
}

type ImageInfo struct {
	URL    string `json:"url"`
	Width  string `json:"width"`
	Height string `json:"height"`
	Alt    string `json:"alt"`
}
