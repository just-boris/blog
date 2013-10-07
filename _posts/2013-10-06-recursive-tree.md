---
layout: post
title: Строим рекурсивное дерево
tags: [angular, рекурсия, semantic-ui]
---
Иногда нужно стороить не просто повторяющиеся списки, но еще и с вложенной структурой. Например, так строится дерево файлов и каталогов, или обсуждение где ответы выстроены в цепочки сообщений. С одной стороны, задача не трудная, но при ее реализации возникает несколько тонкостей.

Для описания древовидной структуры данных обычно используется  рекурсивная схема, где вложенные элементы устроены точно так же как и родительские.
{% highlight javascript %}
"reviews": [{
	"text": "Есть только одно благо — знание и только одно зло — невежество",
	"author": "Сократ",
	"reviews": [{
		"author": "Фридрих Ницше",
		"text": "Один я в белом пальто стою красивый"
	}, {
		"author": "Платон",
		"text": "Плох человек, ничего не знающий, и не пытающийся что-нибудь узнать",
		"reviews": [{
			"author": "Сократ",
			"text": "Про cебя пишете?"
		}]
	}]
}]
{% endhighlight %}

А для того чтобы вывести такие данные в `html` нужно рекурсивное описание шаблона, потому что каждый дочерний элемент копирует родительский и тоже может содержать дочерние. Самый простой способ сделать это &mdash; через директиву `ng-include`, которая вставляет шаблон, который содержит `ng-include` самого себя.

{% highlight html %}{% raw %}
	<div ng-controller="ReviewsCtrl">
		<!-- начнем с итератора по корневым отзывам -->
		<div ng-repeat="review in reviews">
			<!-- вставим шаблон комментария -->
			<div ng-include="'review.html'"></div>
		</div>
	</div>
	<!-- Angular позволяет вставлять шаблоны через script своего типа -->
	<script type="text/ng-template" id="review.html">
		<p>{{review.author}}</p>
		<p>{{review.text}}</p>
		<div ng-repeat="review in review.reviews">
			<!-- а у комментария есть ответы -->
			<div ng-include="'review.html'"></div>
		</div>
	</script>
{% endraw %}{% endhighlight %}
<a class="watch-demo" href="{{site.baseurl}}/assets/recursive-tree/">Демо страница</a>

Такая разметка легко построит из указанного JSON дерево комментариев. Для решения этой задачи можно использовать и другие варианты, например сторонние компоненты, которых написано [очень много](https://github.com/search?q=angular+tree). Можно написать и свою рекурсивную директиву для конкретного случая, но проще всего использовать встроенный компонент, как в этом примере. Смотрите демо, пользуйтесь, задавайте вопросы.

Для оформления я решил использовать [Semantic UI](http://semantic-ui.com). У библиотеки интересный подход к именам классов, но результат получился не очень. Получается много классов у одного элемента, и остается непонятно, за что они отвечают. А необходимость самому задавать ширину контейнеру, переопределять цвет ссылок и шрифт текста заставляет плакать. Об этом я написал разработчикам в [issue](https://github.com/jlukic/Semantic-UI/issues/186). Надеюсь они прислушаются к моим пожеланиям, потому что *другой\_популярный\_css-фреймворк* всеми этими достоинствами обладает.