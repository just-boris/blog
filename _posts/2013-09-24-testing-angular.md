---
layout: post
title: Тестирование в Angular 
tags: [angular, protractor, testing]
---

Чтобы приложение работало и приносило радость людям, оно должно стабильно и без ошибок работать. Для этого нужно постоянно тестировать функционал, но на это нужно время и, конечно же, хочется автоматизации. Фреймворк Angular JS изначально построен с расчетом на тестирование кода. В [tutorial](http://docs.angularjs.org/tutorial) уже показывается как писать тесты, а более специфические примеры можно найти в документации или в [тестах](https://github.com/angular/angular.js/tree/master/test) самого фреймворка. Также интересно будет почитать [angular-seed] &mdash; образец построения проекта с испольованием Angular, в том числе с тестами. 

Итак, тестирование приложения на Angular делится на две части

* [End-to-end (E2E)](http://docs.angularjs.org/guide/dev_guide.e2e-testing) &mdash; тестирование "от конца до края", то есть проверка работоспособности сценариев использования целиком, как должен увидеть результат конечный пользователь.
* [Unit testing](http://docs.angularjs.org/guide/dev_guide.unit-testing) &mdash; модульное тестирование, каждый модуль проверяется отдельно.

E2E тестирование - это очень большая тема, в этой статье только о ней и расскажу, о юнит-тестах в другой раз.

End-to-end тестирование это тестирование приложения целиком, аналогично ручному тестированию. Для проведения таких тестов нужно описать сценарии, которые будут проверяться на приложении. 

Раньше для запуска тестов предалагался [плагин для karma](https://github.com/karma-runner/karma-ng-scenario), но такой подход оказался неудобным, поэтому на его главной странице предлагается не использовать его для новых проектов. Для них есть [Protractor](https://github.com/angular/protractor).

Protractor &mdash; это надстройка над [selenium-webdriver](https://code.google.com/p/selenium/wiki/WebDriverJs), упрощающая работу с Angular. Такой подход намного лучше прежнего, с `ng-scenario`, потому что избавляет нас от велосипедов, теперь с браузером общается `selenium-server` a для написания и запуска тестов используется `jasmine`. Разработчики Angular поддерживают этот проект и скоро перенесут свои e2e-тесты на него.

### Установка Protractor в проект

  1. Установить Protractor: `npm install -g protractor`. В [readme](https://github.com/angular/protractor/blob/master/README.md) рекомендуют ставить локально, чтобы не конфликтовать с другими библиотеками, но удобнее сделать так, чтобы команду `protractor` можно было писать без пути до нее
  1. Создать конфигурационный файл. Можно использоваться образцом, лежащем в `node_modules/protractor/referenceConf.js`, который потом можно перенастроить по своему вкусу. 
  1. Установить selenium-server-standalone. Для этого в комплекте идет скрипт-загрузчик `./node_modules/protractor/bin/install_selenium_standalone`
  1. Запустить в фоне selenuim: `java -jar selenium/selenium-server-standalone-2.35.0.jar -Dwebdriver.chrome.driver=./selenium/chromedriver` (считается, что у вас в системе есть java)
  1. Тесты запускаются командой `protractor protractor.conf.js`, где `protractor.conf.js` &mdash; ваш конфиг, созданный на шаге 2

Но перед запуском тестов неплохо бы их написать. Расположение файлов с тестами указывается в свойстве `specs` конфига. Создаем в указанной папке файл `app_spec.js`, и описываем в нем наш сценарий. Здесь приведены [e2e тесты](https://github.com/angular/angular-seed/blob/master/test/e2e/scenarios.js) проекта [angular-seed], переписанные под Protractor.

{% highlight javascript %}
describe('app main page', function() {
    //глобальная ссылка на экземпляр webdriver
    var ptor, appUrl;
    beforeEach(function() {
        ptor = protractor.getInstance();
        appUrl = ptor.baseUrl + 'app/index.html'; 
        ptor.get(appUrl);
    });

    it('should automatically redirect to /view1 form default path', function() {
      //пример доступа к текущему адресу
      expect(ptor.getCurrentUrl()).toBe(appUrl + "#/view1");
    });

    it('should render view1 when user navigates to /view1', function() {
      ptor.navigate().to(appUrl + '#/view1');
      //пример доступа к элементу по css
      var content = ptor.findElement(protractor.By.css('[ng-view] p:first-child'));
      expect(content.getText()).toMatch(/partial for view 1/);
    });

    //аналогичный тест для второй страницы
    it('should render view2 when user navigates to /view2', function() {
      ptor.navigate().to(appUrl + '#/view2');
      var content = ptor.findElement(protractor.By.css('[ng-view] p:first-child'));
      expect(content.getText()).toMatch(/partial for view 2/);
    });
});
{% endhighlight %}

С тестированием взаимодействия с серверной частью могут возникнуть сложности. E2E-тестирование предусматривает проверку полностью собранного приложения, соответственно так просто отделить запросы к серверу не получится, лучше тестировать с сервером, пусть и тестовым, например [servme](https://github.com/testdouble/servme) &mdash; gem для ruby, который имитирует работу сервера.

Если все-таки необходимо обойтись без сервера, то нужно модифицировать тестируемое приложение, потому что код сценариев изолирован от кода приложения и менять его не может. Создадим новый модуль, зависящий от основного модуля приложения и модуля `ngMockE2E`, и опишем в нем имитацию ответов к серверу:

{% highlight javascript %}
var testingApp = angular.module('testingApp', ['myApp', 'ngMockE2E']);
testingApp.run(function($httpBackend) {
  //имитация успешного ответа
  $httpBackend.whenGET('/cat/list').respond([{name: 'cat1'}, {name: 'cat2'}]);
 
  //можно сымитировать ошибку
  $httpBackend.whenPOST('/cat').respond(function(method, url, data) {
    return data.name === 'loc dog' ? [403, {error: 'No dogs allowed!'}] : [200, {}];
  });
  //если запрос сможет обслужить сервер, то его можно туда и отправить
  $httpBackend.whenGET(/^\/dogs\//).passThrough();
  //...
});
{% endhighlight %}

Подробности можно посмотреть в [соответствующей issue](https://github.com/angular/protractor/issues/31), там есть и другие решения, кроме описнных.

Таким образом, с помощью e2e теста можно охватить всю функциональность приложения целиком и убедиться, что сценарии использования выполняются успешно. Но, во-первых, такие тесты требуют полной загрузки страницы для каждого сценария, а во-вторых при их провале трудно выяснить, в каком именно месте что-то пошло не так. Поэтому, чтобы e2e-тесты не разрастались до больших размеров, на каждый модуль пишут unit-тесты, которые гарантируют работу отдельного модуля, а e2e-тесты отвечают за интерграцию модулей в единое приложение.

[angular-seed]: https://github.com/angular/angular-seed