---
layout: post
title: Как искусственно создать scope
draft: true
tags: [angular]
---
Иногда элементы управления на странице конфликтуют и возникает необходимость разделить их друг от друга и уложить каждый в свою область видимости. При этом особой хитроумной логики у них нет, поэтому создавать полноценный контроллер или писать директиву нет смысла. Вот, например, таблица имен кошек их цветов с возможностью выделения строк в ней:

{% highlight html %}
	<table>
	<tr>
		<th>Name</th>
		<th>Colour</th>
	</tr>
	<tr ng-class="{selected:rowSelected}" ng-click="rowSelected=!rowSelected">
		<td>Ruby<td>
		<td>Grey</td>
	</tr>
	<tr ng-class="{selected:rowSelected}" ng-click="rowSelected=!rowSelected">
		<td>Eve<td>
		<td>Brown with stripes</td>
	</tr>
	<tr ng-class="{selected:rowSelected}" ng-click="rowSelected=!rowSelected">
		<td>Simon<td>
		<td>White</td>
	</tr>
	</table>
{% endhighlight %}
*[Plunker](http://run.plnkr.co/plunks/yMJ5YL/)*

И выделение не работает, строки выделяются все разом. Это потому что у них общая область видимости и они дерутся за общее свойство rowSelected, поэтому клик на любом из рядов отмечает их все.
Исправить это нам поможет директива `ngController`, которая создает новую область видимости, с наследованием предыдущей. Однако она обязательно требует указать ей название контроллера, но у нас нет логики, которую нужно определить в контроллере. Поэтому мы создадим пустой контроллер, функцию, не выполняющую ничего. В [документации `ngController`](http://docs.angularjs.org/api/ng.directive:ngController) сказано, что она принимает на вход выражение из текущего `Scope` или глобально доступную функцию. В Angular как раз есть такая подходящая - `angular.noop` - функция, не делающая ничего.
Если поставить ее в атрибут `ng-controller`, то создастся пустой контроллер, а для него будет создана новый scope и соответственно все действия внутри него там и останутся.

{% highlight html %}
	<table>
		<tr>
			<th>Name</th>
			<th>Colour</th>
		</tr>
		<tr ng-controller="angular.noop" ng-class="{selected:rowSelected}" 
				ng-click="rowSelected=!rowSelected">
			<td>Ruby</td>
			<td>Grey</td>
		</tr>
		<tr ng-controller="angular.noop" ng-class="{selected:rowSelected}" 
				ng-click="rowSelected=!rowSelected">
			<td>Eve</td><td>Brown with stripes</td>
		</tr>
		<tr ng-controller="angular.noop" ng-class="{selected:rowSelected}" 
				ng-click="rowSelected=!rowSelected">
			<td>Simon</td>
			<td>White</td>
		</tr>
	</table>
{% endhighlight %}
*[Plunker](http://run.plnkr.co/plunks/u7ddXw/)*

Получилось громоздко, но зато кроме этого, ничего писать уже не нужно. В случае вывода таблицы через `ngRepeat` подобные финты не нужны, потому что эта директива сама заботливо создает нам новую область видимости. Но если таблица формируется на сервере или захардкожена в шаблоне, то нам нужно самим позаботиться о разделении областей видимости.

Не забываем поблагодарить identity function за прекрасную работу в качестве контроллера!