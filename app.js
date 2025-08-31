import express from 'express';
import generateName from 'sillyname';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let sillyNames = [];
let lastClassSizeText = null;
let lastGrade = null;

function handleNewClass(classSizeText, grade, res) {
    if (!classSizeText || !grade) {
        return res.redirect('/');
    }

    lastClassSizeText = classSizeText;
    lastGrade = grade;

    let classSize;
    if (classSizeText === "small") {
        classSize = randomInt(1, 5);
    } else if (classSizeText === "medium") {
        classSize = randomInt(6, 10);
    } else if (classSizeText === "large") {
        classSize = randomInt(11, 32);
    }

    let baseAge = 6;

    sillyNames = Array.from({ length: classSize }, () => ({
        name: generateName(),
        age: randomInt(baseAge, baseAge + 2) + Number(grade) - 1,
    }));

    res.render('index.ejs', { sillyNames, classSizeText, grade });
}



app.get('/', (req, res) => {
    res.render('index.ejs', { sillyNames });
});



app.post('/newclass', (req, res) => {
    handleNewClass(req.body.class_size, req.body.grade, res);
})



app.post('/reload', (req, res) => {
    handleNewClass(lastClassSizeText, lastGrade, res);
});



app.get('/download/:type', (req, res) => {
    const fileType = req.params.type;

    if (!sillyNames.length) return res.send("No classroom generated yet.");

    let data, filename;

    if (fileType === 'json') {
        data = JSON.stringify(sillyNames, null, 2);
        filename = "roster.json";
        res.setHeader("Content-Type", "application/json");
    } else if (fileType === 'txt') {
        data = sillyNames.map(s => `Name: ${s.name}, Age: ${s.age}`).join("\n");
        filename = "roster.txt";
        res.setHeader("Content-Type", "text/plain");
    } else return res.send("Unsupported file type");

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(data);
})



app.get('/reset', (req, res) => {
    sillyNames = [];
    res.redirect('/');
});



app.listen(port, () => {
    console.log(`The app is running on 'http://localhost:${port}/'`)
})