// <nowiki>
// vim: set noet sts=0 sw=8:


(function($) {


/*
 ****************************************
 *** friendlytag.js: Tag module
 ****************************************
 * Mode of invocation:     Tab ("Tag")
 * Active on:              Existing articles;
 *                         all redirects
 * Config directives in:   FriendlyConfig
 */

Twinkle.tag = function friendlytag() {
	if (Morebits.wiki.isPageRedirect()) {
		// redirect tagging
		Twinkle.tag.mode = '重定向';
		Twinkle.addPortletLink(Twinkle.tag.callback, wgULS('标记', '標記'), 'friendly-tag', wgULS('标记重定向', '標記重定向'));
	} else if ((mw.config.get('wgNamespaceNumber') === 0 && mw.config.get('wgCurRevisionId')) || (Morebits.pageNameNorm === wgULS('Wikivoyage:涂鸦墙', 'Wikivoyage:塗鴉牆'))) {
		// article tagging
		Twinkle.tag.mode = wgULS('条目', '條目');
		Twinkle.addPortletLink(Twinkle.tag.callback, wgULS('标记', '標記'), 'friendly-tag', wgULS('标记条目', '標記條目'));
	}
};

Twinkle.tag.callback = function friendlytagCallback() {
	var Window = new Morebits.simpleWindow(630, Twinkle.tag.mode === wgULS('条目', '條目') ? 500 : 400);
	Window.setScriptName('Twinkle');
	// anyone got a good policy/guideline/info page/instructional page link??
	Window.addFooterLink(wgULS('Twinkle帮助', 'Twinkle幫助'), 'w:WP:TW/DOC#tag');

	var form = new Morebits.quickForm(Twinkle.tag.callback.evaluate);

	if (document.getElementsByClassName('patrollink').length) {
		form.append({
			type: 'checkbox',
			list: [
				{
					label: wgULS('标记页面为已巡查', '標記頁面為已巡查'),
					value: 'patrolPage',
					name: 'patrolPage',
					checked: Twinkle.getFriendlyPref('markTaggedPagesAsPatrolled')
				}
			]
		});
	}

	switch (Twinkle.tag.mode) {
		case wgULS('条目', '條目'):
			Window.setTitle(wgULS('条目维护标记', '條目維護標記'));

			form.append({
				type: 'select',
				name: 'sortorder',
				label: wgULS('察看列表：', '察看列表：'),
				tooltip: wgULS('您可以在Twinkle参数设置（WV:TWPREFS）中更改此项。', '您可以在Twinkle參數設置（WV:TWPREFS）中更改此項。 '),
				event: Twinkle.tag.updateSortOrder,
				list: [
					{ type: 'option', value: 'cat', label: wgULS('按类别', '按類別'), selected: Twinkle.getFriendlyPref('tagArticleSortOrder') === 'cat' },
					{ type: 'option', value: 'alpha', label: '按字母', selected: Twinkle.getFriendlyPref('tagArticleSortOrder') === 'alpha' }
				]
			});

			form.append({
				type: 'div',
				id: 'tagWorkArea',
				className: 'morebits-scrollbox',
				style: 'max-height: 28em'
			});

			break;

		case '重定向':
			Window.setTitle(wgULS('重定向标记', '重定向標記'));
			form.append({ type: 'header', label: wgULS('（暂无）', '（暫無）') });
			break;

		default:
			alert('Twinkle.tag：未知模式 ' + Twinkle.tag.mode);
			break;
	}

	form.append({ type: 'submit' });

	var result = form.render();
	Window.setContent(result);
	Window.display();

	if (Twinkle.tag.mode === wgULS('条目', '條目')) {
		// fake a change event on the sort dropdown, to initialize the tag list
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.sortorder.dispatchEvent(evt);
	}
};

Twinkle.tag.checkedTags = [];

Twinkle.tag.updateSortOrder = function(e) {
	var sortorder = e.target.value;

	Twinkle.tag.checkedTags = e.target.form.getChecked('articleTags');
	if (!Twinkle.tag.checkedTags) {
		Twinkle.tag.checkedTags = [];
	}

	var container = new Morebits.quickForm.element({ type: 'fragment' });

	// function to generate a checkbox, with appropriate subgroup if needed
	var makeCheckbox = function(tag, description) {
		var checkbox = { value: tag, label: '{{' + tag + '}}: ' + description };
		if (Twinkle.tag.checkedTags.indexOf(tag) !== -1) {
			checkbox.checked = true;
		}
		switch (tag) {
			case 'merge':
			case 'merge from':
				var otherTagName = 'merge';
				switch (tag) {
					case 'merge from':
						otherTagName = 'merge';
						break;
					case 'merge':
						otherTagName = 'merge from';
						break;
					default:
						break;
				}
				checkbox.subgroup = [
					{
						name: 'mergeTarget',
						type: 'input',
						label: wgULS('其他条目：', '其他條目：'),
						tooltip: wgULS('只支持一个条目', '只支援一個條目')
					},
					{
						name: 'mergeTagOther',
						type: 'checkbox',
						list: [
							{
								label: '用{{' + otherTagName + wgULS('}}标记其他条目', '}}標記其他條目'),
								checked: true,
								tooltip: ''
							}
						]
					}
				];
				if (mw.config.get('wgNamespaceNumber') === 0) {
					checkbox.subgroup.push({
						name: 'mergeReason',
						type: 'textarea',
						label: wgULS('合并理由（会被贴上', '合併理由（會被貼上') +
							(tag === 'merge' ? wgULS('这', '這') : '其他') + wgULS('条目的讨论页）：', '條目的討論頁）：'),
						tooltip: wgULS('可选，但强烈推荐。如不需要请留空。仅在只输入了一个条目名时可用。', '可選，但強烈建議。若不需要請留空。僅在只輸入了一個條目名時可用。 ')
					});
				}
				break;
			case 'translate':
				checkbox.subgroup = [
					{
						name: 'transLang',
						type: 'input',
						label: wgULS('语言：', '語言：'),
						tooltip: wgULS('需要翻译自的语言代码', '需要翻譯自的語言代碼')
					},
					{
						name: 'transArticle',
						type: 'input',
						label: wgULS('条目：', '條目：'),
						tooltip: wgULS('需要翻译自的条目（可选）', '需要翻譯自的條目（可選）')
					}
				];
				break;
			default:
				break;
		}
		return checkbox;
	};

	// categorical sort order
	if (sortorder === 'cat') {
		// function to iterate through the tags and create a checkbox for each one
		var doCategoryCheckboxes = function(subdiv, array) {
			var checkboxes = [];
			$.each(array, function(k, tag) {
				var description = Twinkle.tag.article.tags[tag];
				checkboxes.push(makeCheckbox(tag, description));
			});
			subdiv.append({
				type: 'checkbox',
				name: 'articleTags',
				list: checkboxes
			});
		};

		var i = 0;
		// go through each category and sub-category and append lists of checkboxes
		$.each(Twinkle.tag.article.tagCategories, function(title, content) {
			container.append({ type: 'header', id: 'tagHeader' + i, label: title });
			var subdiv = container.append({ type: 'div', id: 'tagSubdiv' + i++ });
			if ($.isArray(content)) {
				doCategoryCheckboxes(subdiv, content);
			} else {
				$.each(content, function(subtitle, subcontent) {
					subdiv.append({ type: 'div', label: [ Morebits.htmlNode('b', subtitle) ] });
					doCategoryCheckboxes(subdiv, subcontent);
				});
			}
		});
	} else {
		// alphabetical sort order
		var checkboxes = [];
		$.each(Twinkle.tag.article.tags, function(tag, description) {
			checkboxes.push(makeCheckbox(tag, description));
		});
		container.append({
			type: 'checkbox',
			name: 'articleTags',
			list: checkboxes
		});
	}

	// append any custom tags
	if (Twinkle.getFriendlyPref('customTagList').length) {
		container.append({ type: 'header', label: wgULS('自定义模板', '自定義模板') });
		container.append({ type: 'checkbox', name: 'articleTags', list: Twinkle.getFriendlyPref('customTagList') });
	}

	var $workarea = $(e.target.form).find('div#tagWorkArea');
	var rendered = container.render();
	$workarea.empty().append(rendered);

	// style adjustments
	$workarea.find('h5').css({ 'font-size': '110%' });
	$workarea.find('h5:not(:first-child)').css({ 'margin-top': '1em' });
	$workarea.find('div').filter(':has(span.quickformDescription)').css({ 'margin-top': '0.4em' });

	// add a link to each template's description page
	$.each(Morebits.quickForm.getElements(e.target.form, 'articleTags'), function(index, checkbox) {
		var $checkbox = $(checkbox);
		var link = Morebits.htmlNode('a', '>');
		link.setAttribute('class', 'tag-template-link');
		link.setAttribute('href', mw.util.getUrl('Template:' +
			Morebits.string.toUpperCaseFirstChar(checkbox.values)));
		link.setAttribute('target', '_blank');
		$checkbox.parent().append(['\u00A0', link]);
	});
};


// Tags for ARTICLES start here

Twinkle.tag.article = {};

// A list of all article tags, in alphabetical order
// To ensure tags appear in the default "categorized" view, add them to the tagCategories hash below.

Twinkle.tag.article.tags = {
	'advert': wgULS('类似广告或宣传性内容', '類似廣告或宣傳性內容'),
	'copypaste': wgULS('内容可能是从某个来源处拷贝后贴上', '內容可能是從某個來源處拷貝後貼上'),
	'crop': wgULS('横幅尺寸不正确，应该剪裁为横纵比是7:1的形式', '橫幅尺寸不正確，應該剪裁為橫縱比是7:1的形式'),
	'dead end': wgULS('需要更多内部连接以构筑链接网络', '需要更多內部連結以構築連結網路'),
	'merge': wgULS('建议将此页面并入页面', '建議將此頁面併入頁面'),
	'merge from': wgULS('建议将页面并入本页面', '建議將頁面併入本頁面'),
	'movetocity': wgULS('移动列表到适合的城市条目', '移動列表到適合的城市條目'),
	'movetodistrict': wgULS('移动个别列表到对应的区', '移動個別列表到對應的區'),
	'style': wgULS('不符合格式手册', '不符合格式手冊'),
	'subst:transcription/auto': wgULS('复制自其他语言，存在大量未翻译内容', '複製自其他語言，存在大量未翻譯內容'),
	'translate': wgULS('需要翻译', '需要翻譯'),
	'poortranslation': wgULS('内部内容翻译质量仍然不佳，需要改善', '內部內容翻譯品質不佳，需要改善')
	// "update": wgULS("清理和维护模板", "清理和維護模板")
};

// A list of tags in order of category
// Tags should be in alphabetical order within the categories
// Add new categories with discretion - the list is long enough as is!

Twinkle.tag.article.tagCategories = wgULS({
	'清理和维护模板': {
		'可能多余的内容': [
			'copypaste'
		]
	},
	'常规条目问题': {
		'写作风格': [
			'advert',
			'style'
		]
		/* "时间性": [
			"update"
		] */
	},
	'具体内容问题': {
		'横幅': [
			'crop'
		],
		'语言': [
			'subst:transcription/auto',
			'translate',
			'poortranslation'
		],
		'链接': [
			'dead end'
		],
		'列表项': [
			'movetocity',
			'movetodistrict'
		]
	},
	'合并': [  // these three have a subgroup with several options
		'merge',
		'merge from'
	]
}, {
	'清理和維護模板': {
		'可能多餘的內容': [
			'copypaste'
		]
	},
	'常規條目問題': {
		'寫作風格': [
			'advert',
			'style'
		]
		/* "時間性": [
			"update"
		] */
	},
	'具體內容問題': {
		'橫幅': [
			'crop'
		],
		'語言': [
			'subst:transcription/auto',
			'translate',
			'poortranslation'
		],
		'連結': [
			'dead end'
		],
		'列表項': [
			'movetocity',
			'movetodistrict'
		]
	},
	'合併': [ // these three have a subgroup with several options
		'merge',
		'merge from'
	]
});

// Tags for REDIRECTS start here


Twinkle.tag.callbacks = {
	main: function(pageobj) {
		var params = pageobj.getCallbackParameters(),
			tagRe, tagText = '', summaryText = '添加',
			tags = [], i, totalTags;

		// Remove tags that become superfluous with this action
		var pageText = pageobj.getPageText().replace(/\{\{\s*([Nn]ew unreviewed article|[Uu]nreviewed|[Uu]serspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, '');

		var addTag = function friendlytagAddTag(tagIndex, tagName) {
			var currentTag = '';
			currentTag += (Twinkle.tag.mode === '重定向' ? '\n' : '') + '{{' + tagName;

			// prompt for other parameters, based on the tag
			switch (tagName) {
				case 'merge':
				case 'merge from':
					if (params.mergeTarget) {
						// normalize the merge target for now and later
						params.mergeTarget = Morebits.string.toUpperCaseFirstChar(params.mergeTarget.replace(/_/g, ' '));

						currentTag += '|' + params.mergeTarget;

						// link to the correct section on the talk page, for article space only
						if (mw.config.get('wgNamespaceNumber') === 0 && (params.mergeReason || params.discussArticle)) {
							if (!params.discussArticle) {
								// discussArticle is the article whose talk page will contain the discussion
								params.discussArticle = tagName === 'merge' ? mw.config.get('wgTitle') : params.mergeTarget;
								// nonDiscussArticle is the article which won't have the discussion
								params.nonDiscussArticle = tagName === 'merge' ? params.mergeTarget : mw.config.get('wgTitle');
								params.talkDiscussionTitle = wgULS('请求与', '請求與') + params.nonDiscussArticle + wgULS('合并', '合併');
							}
							currentTag += '|discuss=Talk:' + params.discussArticle + '#' + params.talkDiscussionTitle;
						}
					}
					break;
				case 'translate':
					currentTag += '|' + params.transLang;
					if (params.transArticle) {
						currentTag += '|' + params.transArticle;
					}
					break;
				default:
					break;
			}

			currentTag += '}}\n';
			tagText += currentTag;


			if (tagIndex > 0) {
				if (tagIndex === (totalTags - 1)) {
					summaryText += '和';
				} else if (tagIndex < (totalTags - 1)) {
					summaryText += '、';
				}
			}

			summaryText += '{{[[';
			summaryText += tagName.indexOf(':') !== -1 ? tagName : 'Template:' + tagName + '|' + tagName;
			summaryText += ']]}}';
		};

		if (Twinkle.tag.mode !== '重定向') {
			// Check for preexisting tags and add tags to arrays
			for (i = 0; i < params.tags.length; i++) {
				tagRe = new RegExp('(\\{\\{' + params.tags[i] + '(\\||\\}\\})|\\|\\s*' + params.tags[i] + '\\s*=[a-z ]+\\d+)', 'im');
				if (!tagRe.exec(pageText)) {
					tags = tags.concat(params.tags[i]);
				} else {
					Morebits.status.warn(wgULS('信息', '信息'), wgULS('在页面上找到{{', '在頁面上找到{{') + params.tags[i] +
						wgULS('}}…跳过', '}}…跳過'));
					// don't do anything else with merge tags
					if (params.tags[i] === 'merge' || params.tags[i] === 'merge from') {
						params.mergeTarget = params.mergeReason = params.mergeTagOther = false;
					}
				}
			}

		} else {
			// Redirect tagging: Check for pre-existing tags
			for (i = 0; i < params.tags.length; i++) {
				tagRe = new RegExp('(\\{\\{' + params.tags[i] + '(\\||\\}\\}))', 'im');
				if (!tagRe.exec(pageText)) {
					tags = tags.concat(params.tags[i]);
				} else {
					Morebits.status.warn(wgULS('信息', '訊息'), '在重定向上找到{{' + params.tags[i] +
						wgULS('}}…跳过', '}}…跳過'));
				}
			}
		}

		tags.sort();
		totalTags = tags.length;
		$.each(tags, addTag);

		if (Twinkle.tag.mode === '重定向') {
			pageText += tagText;
		} else {
			// smartly insert the new tags after any hatnotes. Regex is a bit more
			// complicated than it'd need to be, to allow templates as parameters,
			// and to handle whitespace properly.
			pageText = pageText.replace(/^\s*(?:((?:\s*\{\{\s*(?:about|correct title|confused|dablink|distinguish|for|other\s?(?:hurricaneuses|people|persons|places|uses(?:of)?)|pagebanner|redirect(?:-acronym)?|see\s?(?:also|wiktionary)|selfref|the|noteTA|[他它]用|主?[條条]目消歧[義义]|[關关][於于]|不是|混淆|[區区分][別别]|(?:本?[條条]目的?)?主[題题]不是)\d*\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\})+(?:\s*\n)?)\s*)?/i,
				'$1' + tagText);
		}
		summaryText += (tags.length > 0 ? '标记' : '') +
			'到' + Twinkle.tag.mode;

		// avoid truncated summaries
		if (summaryText.length > (254 - Twinkle.getPref('summaryAd').length)) {
			summaryText = summaryText.replace(/\[\[[^|]+\|([^\]]+)\]\]/g, '$1');
		}

		pageobj.setPageText(pageText);
		pageobj.setEditSummary(summaryText + Twinkle.getPref('summaryAd'));
		pageobj.setWatchlist(Twinkle.getFriendlyPref('watchTaggedPages'));
		pageobj.setMinorEdit(Twinkle.getFriendlyPref('markTaggedPagesAsMinor'));
		pageobj.setCreateOption('nocreate');
		pageobj.save(function() {
			// special functions for merge tags
			if (params.mergeReason) {
				// post the rationale on the talk page (only operates in main namespace)
				var talkpageText = wgULS('\n\n== 请求与[[', '\n\n== 請求與[[') + params.nonDiscussArticle + wgULS(']]合并 ==\n\n', ']]合併 ==\n\n');
				talkpageText += params.mergeReason.trim() + '--~~~~';

				var talkpage = new Morebits.wiki.page('Talk:' + params.discussArticle, wgULS('将理由贴进讨论页', '將理由貼進討論頁'));
				talkpage.setAppendText(talkpageText);
				talkpage.setEditSummary(wgULS('请求将[[', '請求將[[') + params.nonDiscussArticle + ']]' +
					wgULS('与', '與') + '[[' + params.discussArticle + wgULS(']]合并', ']]合併') +
					Twinkle.getPref('summaryAd'));
				talkpage.setWatchlist(Twinkle.getFriendlyPref('watchMergeDiscussions'));
				talkpage.setCreateOption('recreate');
				talkpage.append();
			}
			if (params.mergeTagOther) {
				// tag the target page if requested
				var otherTagName = 'merge';
				if (tags.indexOf('merge from') !== -1) {
					otherTagName = 'merge';
				} else if (tags.indexOf('merge') !== -1) {
					otherTagName = 'merge from';
				}
				var newParams = {
					tags: [otherTagName],
					mergeTarget: Morebits.pageNameNorm,
					discussArticle: params.discussArticle,
					talkDiscussionTitle: params.talkDiscussionTitle
				};
				var otherpage = new Morebits.wiki.page(params.mergeTarget, wgULS('标记其他页面（', '標記其他頁面（') +
					params.mergeTarget + '）');
				otherpage.setCallbackParameters(newParams);
				otherpage.load(Twinkle.tag.callbacks.main);
			}
		});

		if (params.patrol) {
			pageobj.patrol();
		}
	}
};

Twinkle.tag.callback.evaluate = function friendlytagCallbackEvaluate(e) {
	var form = e.target;
	var params = {};
	if (form.patrolPage) {
		params.patrol = form.patrolPage.checked;
	}

	switch (Twinkle.tag.mode) {
		case wgULS('条目', '條目'):
			params.tags = form.getChecked('articleTags');
			params.tagParameters = {};
			// common to {{merge}}, {{merge from}}
			params.mergeTarget = form['articleTags.mergeTarget'] ? form['articleTags.mergeTarget'].value : null;
			params.mergeReason = form['articleTags.mergeReason'] ? form['articleTags.mergeReason'].value : null;
			params.mergeTagOther = form['articleTags.mergeTagOther'] ? form['articleTags.mergeTagOther'].checked : false;
			// {{translate}}
			params.transLang = form['articleTags.transLang'] ? form['articleTags.transLang'].value : null;
			params.transArticle = form['articleTags.transArticle'] ? form['articleTags.transArticle'].value : null;
			break;
		case '重定向':
			params.tags = form.getChecked('redirectTags');
			break;
		default:
			alert('Twinkle.tag：未知模式 ' + Twinkle.tag.mode);
			break;
	}

	// form validation
	if (!params.tags.length) {
		alert(wgULS('必须选择至少一个标记！', '必須選擇至少一個標記！ '));
		return;
	}
	if (((params.tags.indexOf('merge') !== -1) + (params.tags.indexOf('merge from') !== -1)) > 1) {
		alert(wgULS('请在{{merge}}和{{merge from}}中选择一个。', '請在{{merge}}和{{merge from}}中選擇一個。 '));
		return;
	}
	if ((params.mergeTagOther || params.mergeReason) && params.mergeTarget.indexOf('|') !== -1) {
		alert(wgULS('目前还不支持在一次合并中标记多个条目，与开启关于多个条目的讨论。请不要勾选“标记其他条目”和/或清理“理由”框，并重试。', '目前還不支援在一次合併中標記多個條目，與開啟關於多個條目的討論。請不要勾選“標記其他條目”和/或清理“理由”框，並重試。 '));
		return;
	}

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init(form);

	Morebits.wiki.actionCompleted.redirect = Morebits.pageNameNorm;
	Morebits.wiki.actionCompleted.notice = wgULS('标记完成，在几秒内刷新页面', '標記完成，在幾秒內更新頁面');
	if (Twinkle.tag.mode === '重定向') {
		Morebits.wiki.actionCompleted.followRedirect = false;
	}

	var wikipedia_page = new Morebits.wiki.page(Morebits.pageNameNorm, wgULS('正在标记', '正在標記') + Twinkle.tag.mode);
	wikipedia_page.setCallbackParameters(params);
	switch (Twinkle.tag.mode) {
		case wgULS('条目', '條目'):
			/* falls through */
		case '重定向':
			wikipedia_page.load(Twinkle.tag.callbacks.main);
			return;
		default:
			alert('Twinkle.tag：未知模式 ' + Twinkle.tag.mode);
			break;
	}
};
})(jQuery);


// </nowiki>
