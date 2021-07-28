const config = require('./config.js');
const osmosis = require('osmosis');
const parser = require('node-html-parser');
const bodyParser = require('body-parser');
const express = require('express');
var Pool = require('phantomjs-pool').Pool;


var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
var allActions = config.AllActions();




app.get('/', function(req, res) {
    res.render('index');
});




app.get('/designations', urlencodedParser, function(req, res) {
  if (req.query.number.match(/^[0-9]+([A-Z]|[0-9])$/g) == null) return res.send('\nНомер заявки введён некорректно.\n');
  let url = 'https://www3.wipo.int/madrid/monitor/en/showData.jsp?ID=' + req.query.number;
  let designCountries = [];
  //  Проверка существования заявки с введённым номером
  let appListCountries = [];
  let check = osmosis.get(url).find('#documentContent').set(['.markname']);
  check.data(data => {
    if (!data[0])
      return res.send('\nВведён несуществующий номер заявки.\n');
  })
  //  Поиск стран, в которые были поданы заявки
  var appListCountriesPr10 = new Promise(resolve => {
    osmosis
    .get(url)
    .find('#container-4')
    .set(['.fragment-content .transaction .ligneBox .txt .text a'])
    .data(function(data) {
      appListCountries = data;
      resolve(appListCountries);
    })
  });
  //  Создание выборки из обозначений стран
  var designCountriesPr11 = new Promise(resolve => {
    appListCountriesPr10.then(appListCountries => {
      if (appListCountries != null)
      {
        for (let i = 0; i < appListCountries.length; i++)
        {
          let tmpStr = appListCountries[i];
          let len = tmpStr.length;
          let tmpDes = tmpStr[len - 3] + tmpStr[len - 2];
          designCountries.push(tmpDes);
        }
        designCountries = designCountries.filter(function(item, pos) {
          return designCountries.indexOf(item) == pos;
        })
      }
      else
        designCountries = null;
      resolve(designCountries);
    })
  });
  designCountriesPr11.then(designCountries => {
    if (designCountries != null)
    {
      let ind = designCountries.indexOf('RU');
      if (ind != -1)
        designCountries.splice(0, 0, designCountries.splice(ind, 1)[0]);
      res.render('designations', {desigs: designCountries, number: req.query.number});
      console.log(`\nFound designations for ${req.query.number}.\n`);
    }
    else
      return res.send('\nВведён несуществующий номер заявки.\n');
  });
});




app.get('/search', urlencodedParser, function(req, res) {
  if (req.query.number.match(/^[0-9]+([A-Z]|[0-9])$/g) == null) return res.send('\nНомер заявки введён некорректно.\n');
  let chosenCountry = req.query.chosen_desig;
  let userGeneralMsg = 'Запрос к системе Madrid Monitor выполнен успешно!';
  let url = 'https://www3.wipo.int/madrid/monitor/en/showData.jsp?ID=' + req.query.number;


  function jobCallback(job, worker, index) {
    if (index < 1)
    {
      job(
      {
        url : url,
        chosenCountry : chosenCountry
      },
      function(err, data)
      {
        if (err)
        {
          userGeneralMsg = '\nОшибка запроса к сервису Madrid Monitor. Попробуйте повторить команду через несколько секунд.\n';
          console.log(userGeneralMsg);
          return res.send(userGeneralMsg);
        }
        else
        {
          let html = data.html;
          let page = parser.parse(html);
          //Регистрационный номер и наименование товарного знака
          let nameOfTrademark;
          nameOfTrademark = page.querySelector('#documentContent .markname').text;


          //Дата регистрации
          let regIndex,
          dateOfRegistr,
          datesOfRegistr = [],
          datesOfRegistrCodes = [];
          page.querySelectorAll('.box_content:first-child .description .p .inidCode').forEach(function(data){
            datesOfRegistrCodes.push(data.text);
          });
          regIndex = datesOfRegistrCodes.indexOf('151');
          page.querySelectorAll('.box_content:first-child .description .p .text').forEach(function(data){
            datesOfRegistr.push(data.text);
          });
          if (datesOfRegistr[regIndex])
            dateOfRegistr = datesOfRegistr[regIndex];
          else
            dateOfRegistr = 'В Madrid monitor информация отсутствует';


          //Ожидаемая дата обновления регистрации знака
          let renIndex,
          dateOfRenewal,
          datesOfRenewal = [],
          datesOfRenewalCodes = [];
          page.querySelectorAll('.box_content:first-child .description .p .inidCode').forEach(function(data){
            datesOfRenewalCodes.push(data.text);
          });
          renIndex = datesOfRenewalCodes.indexOf('180');
          page.querySelectorAll('.box_content:first-child .description .p .text').forEach(function(data){
            datesOfRenewal.push(data.text);
          });
          if (datesOfRenewal[renIndex])
            dateOfRenewal = datesOfRenewal[renIndex];
          else
            dateOfRenewal = 'В Madrid monitor информация отсутствует';


          //Язык регистрации товарного знака
          let countryRegIndex,
          countryReg,
          countriesReg = [],
          countriesRegCodes = [];
          page.querySelectorAll('.box_content:first-child .description .p .inidCode').forEach(function(data){
            countriesRegCodes.push(data.text);
          });
          countryRegIndex = countriesRegCodes.indexOf('270');
          page.querySelectorAll('.box_content:first-child .description .p .text').forEach(function(data){
            countriesReg.push(data.text);
          });
          if (countriesReg[countryRegIndex])
            countryReg = countriesReg[countryRegIndex];
          else
            countryReg = 'В Madrid monitor информация отсутствует';


          //Сопоставление кодов и текстов второго блока
          //  Получение кодов и их индексов во втором блоке
          let codesIndexesArr = [[], []];
          page.querySelectorAll(`#fragment-detail > div.fragment-content.box_content.retreci > div > div .inidCode`).forEach(function(data, i) {
            codesIndexesArr[0].push(i + 1);
            codesIndexesArr[1].push(data.text);
          });
          //  Получение текстов и их индексов во втором блоке
          let textsIndexesArr = [[], []];
          page.querySelectorAll(`#fragment-detail > div.fragment-content.box_content.retreci > div > div .text`).forEach(function(data, i) {
            textsIndexesArr[0].push(i + 1);
            textsIndexesArr[1].push(data.text);
          });
          //  Соединение массивов по совпадающим индексов в один (итоговое сопоставление)
          let codesTextsArr = [[], []];
          let codesIndexesArr_len = codesIndexesArr[0].length;
          for (let i = 0; i < codesIndexesArr_len; ++i)
          {
            for (let j = 0; j < codesIndexesArr_len; ++j)
            {
              if (codesIndexesArr[0][i] == textsIndexesArr[0][j])
              {
                codesTextsArr[0].push(codesIndexesArr[1][i]);
                codesTextsArr[1].push(textsIndexesArr[1][j]);
                break ;
              }
            }
          }


          //Детали владельца товарного знака
          let holderDetails;
          let holderIndex = codesTextsArr[0].indexOf('732');
          if (codesTextsArr[1][holderIndex])
            holderDetails = codesTextsArr[1][holderIndex];
          else
            holderDetails = 'В Madrid monitor информация отсутствует';


          //Детали представителя товарного знака
          let representativeDetails;
          let representativeIndex = codesTextsArr[0].indexOf('740');
          if (codesTextsArr[1][representativeIndex])
            representativeDetails = codesTextsArr[1][representativeIndex];
          else
            representativeDetails = 'В Madrid monitor информация отсутствует';


          //Зарегистрированный список классов
          let Classes = []
          let tmpClassesText = [];
          page.querySelectorAll('.retreci .description .p .text > dl > dd .firstLanguage').forEach(function(el) {
            tmpClassesText.push(el.text);
          });
          let tmpClassesNumbers = [];
          page.querySelectorAll('.retreci .description .p .text > dl > dt').forEach(function(el) {
            tmpClassesNumbers.push(el.text);
          });
          let regCl_j = 0;
          for (let i = 0; i < tmpClassesNumbers.length; i++)
          {
            Classes[regCl_j] = [];
            Classes[regCl_j].push(tmpClassesNumbers[i].replace(/\s+/g, ' ').trim());
            Classes[regCl_j].push(tmpClassesText[i].toLowerCase().split('.')[0].replace(/\s+/g, ' ').trim());
            ++regCl_j;
          }
          let regClassesOutList = '';
          for (let i = 0; i < Classes.length; i++)
            regClassesOutList += Classes[i][0] + ': ' + Classes[i][1] + '\n\n';


          //События, связанные с товарным знаком, в выбранной стране
          //  Поиск стран, в которые были поданы заявки
          let appListCountries = [];
          page.querySelectorAll('#container-4 .fragment-content .transaction .ligneBox .txt .text a').forEach(function(data) {
            appListCountries.push(data.text);
          });
          //  Создание выборки из обозначений стран
          let designCountries = [];
          for (let i = 0; i < appListCountries.length; i++)
          {
            let tmpStr = appListCountries[i].replace(/\s+/g, ' ').trim();
            let len = tmpStr.length;
            let tmpDes = tmpStr[len - 3] + tmpStr[len - 2];
            designCountries.push(tmpDes);
          }
          designCountries = designCountries.filter(function(item, pos) {
            return designCountries.indexOf(item) == pos;
          });
          //  Выбор страны по совпадающему обозначению
          let countryNumber = designCountries.indexOf(chosenCountry) + 1;
          //  События по выбранной стране
          let tmpEventsForCountries = [];
          let eventsForCountries;
          page.querySelectorAll(`#container-4 .fragment-content .transaction:nth-child(${countryNumber + 1}) .description .box_content .retreci`).forEach(function(data) {
            tmpEventsForCountries.push(data.text.replace(/\n\n\n\n+/g, '\n--------------------------------------------\n'));
          });
          eventsForCountries = tmpEventsForCountries[0];
          lenEvForCountr = eventsForCountries.split('\n--------------------------------------------\n').length;


          //Определение статуса заявки
          //  Поиск статуса по последнему значимому событию
          let eventsForStatusCountry = [];
          page.querySelectorAll(`#container-4 .fragment-content .transaction:nth-child(${countryNumber + 1}) .description .box_content .retreci .inidText`).forEach(function(data, i) {
            if (eventsForCountries.indexOf(data.text) != -1 && i < lenEvForCountr)
              eventsForStatusCountry.push(data.text);
          });
          let appStatusInCountry = 'Not found';
          let flag = 0;
          for (let i = eventsForStatusCountry.length - 1; i >= 0; i--)
          {
            for (let j = 0; j < allActions.length; j++)
            {
              if (eventsForStatusCountry[i] == allActions[j][0])
              {
                if (allActions[j][1] == 'i')
                {
                  appStatusInCountry = 'Inactive';
                  flag = 1;
                  break ;
                }
                else if (allActions[j][1] == 'a')
                {
                  appStatusInCountry = 'Active';
                  flag = 1;
                  break ;
                }
                else if (allActions[j][1] == 'r')
                {
                  let tmpNoNotifyCheck = page.querySelectorAll(`#container-4 .fragment-content .transaction:nth-child(${countryNumber + 1}) .description .box_content .retreci .text`)[1].text;
                  if (tmpNoNotifyCheck && tmpNoNotifyCheck != undefined && tmpNoNotifyCheck == 'The refusal period has expired and no notification of provisional refusal has been recorded (application of Rule 5 preserved)')
                    appStatusInCountry = 'Active';
                  else
                    appStatusInCountry = 'Inactive';
                  flag = 1;
                  break ;
                }
                else if (allActions[j][1] == 'n')
                {
                  if (i == 0)
                  {
                    appStatusInCountry = 'Inactive';
                    flag = 1;
                  }
                  continue;
                }
              }
              else if (eventsForStatusCountry[i].indexOf('18ter(3)') != -1)
              {
                appStatusInCountry = 'Inactive';
                flag = 1;
                break ;
              }
              else if (eventsForStatusCountry[i].indexOf('18ter(1)') != -1 || eventsForStatusCountry[i].indexOf('18ter(2)') != -1)
              {
                appStatusInCountry = 'Active';
                flag = 1;
                break ;
              }
            }
            if (flag == 1)
              break ;
          }
          if (appStatusInCountry == 'Active')
          {
            let strCurDate = new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"});
            let mmddyyCur = strCurDate.split(',')[0].split('/');
            for (let i = 0; i < mmddyyCur.length; ++i)
            {
              if (Number(mmddyyCur[i]) >= 1 && Number(mmddyyCur[i]) <= 9)
                mmddyyCur[i] = '0' + mmddyyCur[i];
            }
            let curDate = new Date(mmddyyCur[2] + '-' + mmddyyCur[0] + '-' + mmddyyCur[1] + 'T00:00:00.000Z');
            let ddmmyyRen = dateOfRenewal.split('.');
            let expectedRenewalDate = new Date(ddmmyyRen[2] + '-' + ddmmyyRen[1] + '-' + ddmmyyRen[0] + 'T00:00:00.000Z');
            if (curDate.getTime() > expectedRenewalDate.getTime())
            {
              eventsForCountries += '\n==========================================================\n';
              eventsForCountries += 'Срок действия защиты товарного знака истёк.\nОбновление регистрации товарного знака не было осуществлено\nдо ожидаемой даты обновления регистрации товарного знака.';
              appStatusInCountry = 'Inactive';
            }
          }


          //Определение списка классов, одобренного в выбранной стране
          //  Определение изменённого списка классов
          let outClassActions = 'Не найдено.';
          let outClassList = 'Не найдено.';
          let flagFoundActions = 0;
          let detailEventsCountryClass = [];
          let j = 0;
          //    Определение событий, связанных с изменением списка классов
          for (let i = 4; i <= page.querySelectorAll('.transaction.fragment-content.onlyWhenActive .description.box_content.retreci').length + 3; ++i)
          {
            let data = page.querySelector(`.transaction.fragment-content.onlyWhenActive.open:nth-child(${i}) .description.box_content.retreci`);
            if (data != null && (data.text.toLowerCase().indexOf('class') != -1
                || data.text.toLowerCase().indexOf('goods') != -1
                || data.text.toLowerCase().indexOf('services') != -1
                || data.text.toLowerCase().indexOf('for which protection of the mark is granted') != -1
                || data.text.toLowerCase().indexOf('specification') != -1
                || data.text.toLowerCase().match(/list(.|\n)*limit/) != null
                || data.text.toLowerCase().match(/limit(.|\n)*list/) != null
                || data.text.toLowerCase().match(/list(.|\n)*delete/) != null
                || data.text.toLowerCase().match(/delete(.|\n)*list/) != null))
            {
              flagFoundActions = 1;
              detailEventsCountryClass[j] = [];
              detailEventsCountryClass[j].push(data.text.replace(/\n+/g, '\n').trim());
              detailEventsCountryClass[j].push(i);
              ++j;
            }
          }
          if (flagFoundActions == 1)
            outClassActions = detailEventsCountryClass.join('\n--------------------------------------------\n\n');
          else
            outClassActions = 'Не найдены события, связанные с изменениями заявленных классов.';
          //    Передача полученных событий в функцию определения изменённого списка классов
          if (flagFoundActions == 1 && appStatusInCountry == 'Active')
          {
            let {msgClassFunc, arrNewClassRes} = actualClassListFunc(page, detailEventsCountryClass, Classes, flagFoundActions);
            if (msgClassFunc == 'new classes')
            {
              let tmpClListArr = [];
              for (let i = 0; i < arrNewClassRes.length; ++i)
              {
                let tmpClListStr = arrNewClassRes[i].join(': ');
                tmpClListArr.push(tmpClListStr);
              }
              outClassList = tmpClListArr.join('\n\n');
            }
            else if (msgClassFunc == 'no classes left' || msgClassFunc == 'inactive app'
                    || msgClassFunc == 'class actions' || msgClassFunc == 'unable to handle actions')
              outClassList = arrNewClassRes;
          }
          else if (appStatusInCountry == 'Inactive')
            outClassList = 'Регистрация неактивна в данной стране, защита не предоставляется ни одному классу.';
          else
            outClassList = 'Не найдены события, связанные с изменениями заявленных классов.\nАктуальный перечень классов соответствует заявленному при регистрации.\nСм. ЗАЯВЛЕННЫЙ ПЕРЕЧЕНЬ ТОВАРОВ И УСЛУГ.';


          let ind = designCountries.indexOf('RU');
          if (ind != -1)
            designCountries.splice(0, 0, designCountries.splice(ind, 1)[0]);
          //Передача данных в html и вывод результата на сервисе
          res.render('search', {
            chosenCountry: chosenCountry,
            userGeneralMsg: userGeneralMsg,
            nameOfTrademark: nameOfTrademark,
            dateOfRegistr: dateOfRegistr,
            dateOfRenewal: dateOfRenewal,
            countryReg: countryReg,
            holderDetails: holderDetails.replace(/\n\n\n+/g, '').trim(),
            representativeDetails: representativeDetails.replace(/\n\n\n+/g, '').trim(),
            regClassesOutList: regClassesOutList,
            eventsForCountries: eventsForCountries,
            appStatusInCountry: appStatusInCountry,
            outClassActions: outClassActions,
            outClassList: outClassList,
            url: url,
            desigs: designCountries,
            number: req.query.number
          });
          designCountries = [];
          Classes = [];
          chosenCountry = '';
          userGeneralMsg = 'Запрос к системе Madrid Monitor выполнен успешно!';
          nameOfTrademark = '';
          dateOfRegistr = '';
          dateOfRenewal = '';
          countryReg = '';
          holderDetails = '';
          representativeDetails = '';
          regClassesOutList = '';
          eventsForCountries = '';
          outClassActions = '';
          outClassList = '';
      
          console.log(`\nWork completed successfully for ${req.query.number}!\n`);
        }
      });
    }
    else
      job(null);
  }

  let pool = new Pool({
    numWorkers : 1,
    jobCallback : jobCallback,
    workerFile : __dirname + '/worker.js'
  });

  pool.start();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}.`); });


//  Функция определения изменённого списка классов
function actualClassListFunc(page, detailEventsCountryClass, Classes, flagFoundActions)
{
  let newClasses = Classes;
//    Проход по каждому подробному событию, связанному с изменённым списком классов, для выбранной страны
  for (let d_ind = 0; d_ind < detailEventsCountryClass.length; ++d_ind)
  {
    if (detailEventsCountryClass[d_ind][0].indexOf('Delete from list') != -1
      || detailEventsCountryClass[d_ind][0].indexOf('List limited to') != -1
      || detailEventsCountryClass[d_ind][0].indexOf('for which protection of the mark is granted') != -1)
    {
      let data1 = page.querySelectorAll(`.transaction.fragment-content.onlyWhenActive:nth-child(${detailEventsCountryClass[d_ind][1]}) .description.box_content.retreci .inid`);
      for (let d1_ind = 0; d1_ind < data1.length; ++d1_ind)
      {
        if (data1[d1_ind].text.indexOf('Delete from list') != -1)
        {
          flagFoundActions = 2;
          let changeClasses = [];
          let iter = data1[d1_ind].nextElementSibling.firstChild.firstChild;
          let flag = 0;
          while (iter != undefined)
          {
            let arrInd = Math.floor(flag / 2);
            if (flag % 2 == 0)
            {
              changeClasses[arrInd] = [];
              changeClasses[arrInd].push(iter.text.replace(/\s+/g, ' ').trim());
            }
            else
            changeClasses[arrInd].push(iter.text.toLowerCase().split('.')[0].replace(/\s+/g, ' ').trim());
            iter = iter.nextElementSibling;
            ++flag;
          }
          for (let ch_ind = 0; ch_ind < changeClasses.length; ++ch_ind)
          {
            let listDel = changeClasses[ch_ind][1].split(';');
            for (let ind = 0; ind < newClasses.length; ++ind)
            {
              if (changeClasses[ch_ind][0] == newClasses[ind][0])
              {
                let listCl = newClasses[ind][1].split(';');
                for (let ind1 = 0; ind1 < listDel.length; ++ind1)
                {
                  let actFlag = 0;
                  for (let i = 0; i < listCl.length; ++i)
                  {
                    if (listDel[ind1].replace(/\s+/g, ' ').trim() == listCl[i].replace(/\s+/g, ' ').trim())
                    {
                      listCl.splice(i, 1);
                      actFlag = 1;
                      break ;
                    }
                  }
                  if (actFlag == 0)
                    return {msgClassFunc: 'class actions', arrNewClassRes: 'Невозможно корректно определить новый список классов. Смотрите cобытия, связанные\n с изменениями заявленных классов.'};
                }
                newClasses[ind][1] = listCl.join(';').replace(/\s+/g, ' ').trim();
              }
            }
          }
        }
        if (data1[d1_ind].text.indexOf('List limited to') != -1)
        {
          flagFoundActions = 2;
          let changeClasses = [];
          let iter = data1[d1_ind].nextElementSibling.firstChild.firstChild;
          let flag = 0;
          while (iter != undefined)
          {
            let arrInd = Math.floor(flag / 2);
            if (flag % 2 == 0)
            {
              changeClasses[arrInd] = [];
              changeClasses[arrInd].push(iter.text.replace(/\s+/g, ' ').trim());
            }
            else
            changeClasses[arrInd].push(iter.text.toLowerCase().split('.')[0].replace(/\s+/g, ' ').trim());
            iter = iter.nextElementSibling;
            ++flag;
          }
          for (let ch_ind = 0; ch_ind < changeClasses.length; ++ch_ind)
          {
            for (let ind = 0; ind < newClasses.length; ++ind)
            {
              if (changeClasses[ch_ind][0] == newClasses[ind][0])
                newClasses[ind][1] = changeClasses[ch_ind][1];
            }
          }
        }
        if (data1[d1_ind].text.indexOf('for which protection of the mark is granted') != -1)
        {
          flagFoundActions = 2;
          let changeClasses = [];
          let iter = data1[d1_ind].nextElementSibling.firstChild.firstChild;
          let flag = 0;
          while (iter != undefined)
          {
            let arrInd = Math.floor(flag / 2);
            if (flag % 2 == 0)
            {
              changeClasses[arrInd] = [];
              changeClasses[arrInd].push(iter.text.replace(/\s+/g, ' ').trim());
            }
            else
            changeClasses[arrInd].push(iter.text.toLowerCase().split('.')[0].replace(/\s+/g, ' ').trim());
            iter = iter.nextElementSibling;
            ++flag;
          }
          newClasses = changeClasses;
        }
      }
    }
    let strToParse = null;
    strToParse = detailEventsCountryClass[d_ind][0].replace(/\s+/g, ' ').trim().toLowerCase()
    .match(/refus(.|\n)*for all(.|\n)*in class(.|\n)*?[;|\.]/);
    if (strToParse != null)
    {
      flagFoundActions = 2;
      let arrNumClassesToDel = strToParse[0].match(/(\d+)/g);
      for (let i = 0; i < arrNumClassesToDel.length; ++i)
      {
        for (let j = 0; j < newClasses.length; ++j)
        {
          if (arrNumClassesToDel[i] == Number(newClasses[j][0]))
            newClasses.splice(j, 1);
        }
      }
    }
    strToParse = null;
    strToParse = detailEventsCountryClass[d_ind][0].replace(/\s+/g, ' ').trim().toLowerCase()
    .match(/invalid(.|\n)*for all(.|\n)*in class(.|\n)*?[;|\.]/);
    if (strToParse != null)
    {
      flagFoundActions = 2;
      let arrNumClassesToDel = strToParse[0].match(/(\d+)/g);
      for (let i = 0; i < arrNumClassesToDel.length; ++i)
      {
        for (let j = 0; j < newClasses.length; ++j)
        {
          if (arrNumClassesToDel[i] == Number(newClasses[j][0]))
            newClasses.splice(j, 1);
        }
      }
    }
    strToParse = null;
    strToParse = detailEventsCountryClass[d_ind][0].replace(/\s+/g, ' ').trim().toLowerCase()
    .match(/class(.|\n)*cancell/);
    if (strToParse != null)
    {
      flagFoundActions = 2;
      let arrNumClassesToDel = strToParse[0].match(/(\d+)/g);
      for (let i = 0; i < arrNumClassesToDel.length; ++i)
      {
        for (let j = 0; j < newClasses.length; ++j)
        {
          if (arrNumClassesToDel[i] == Number(newClasses[j][0]))
            newClasses.splice(j, 1);
        }
      }
    }
  }
  if (flagFoundActions == 2)
  {
    if (newClasses.length != 0)
      return {msgClassFunc: 'new classes', arrNewClassRes: newClasses};
    else
      return {msgClassFunc: 'no classes left', arrNewClassRes: 'Защита не предоставляется ни одному классу.'};
  }
  else
    return {msgClassFunc: 'unable to handle actions', arrNewClassRes: 'Невозможно корректно определить новый список классов. Смотрите cобытия, связанные\n с изменениями заявленных классов.'};
}
