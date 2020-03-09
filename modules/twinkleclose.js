// <nowiki>
// vim: set noet sts=0 sw=8:


(function($) {


/*
 ****************************************
 *** twinkleclose.js: XFD closing module
 ****************************************
 * Mode of invocation:     Links after section heading
 * Active on:              AfD dated archive pages
 * Config directives in:   TwinkleConfig
 */

Twinkle.close = function twinkleclose() {
	if (!Morebits.userIsInGroup('sysop') || !/^Wikivoyage:删除表决$/.test(mw.config.get('wgPageName'))) {
		return;
	}

	var spanTag = function(color, content) {
		var span = document.createElement('span');
		span.style.color = color;
		span.appendChild(document.createTextNode(content));
		return span;
	};

	var selector = ':has(.mw-headline a:only-of-type):not(:has(+ div.NavFrame))';
	var titles = $('#bodyContent').find('h2' + selector + ':not(:has(+ p + h3)), h3' + selector); // really needs to work on

	var delNode = document.createElement('strong');
	var delLink = document.createElement('a');
	delLink.appendChild(spanTag('Black', '['));
	delLink.appendChild(spanTag('Red', wgULS('关闭讨论', '關閉討論')));
	delLink.appendChild(spanTag('Black', ']'));
	delNode.appendChild(delLink);

	titles.each(function(key, current) {
		var headlinehref = $(current).find('.mw-headline a').attr('href');
		var title;
		if (headlinehref.indexOf('redlink=1') === -1) {
			title = headlinehref.slice(6);
		} else {
			title = headlinehref.slice(19, -22);
		}
		title = decodeURIComponent(title);
		var pagenotexist = $(current).find('.mw-headline a').hasClass('new');
		var section = /section=(\d+)/.exec($(current).find('.mw-editsection a').attr('href'))[1];
		var node = current.getElementsByClassName('mw-headline')[0];
		node.appendChild(document.createTextNode(' '));
		var tmpNode = delNode.cloneNode(true);
		tmpNode.firstChild.href = '#' + section;
		$(tmpNode.firstChild).click(function() {
			Twinkle.close.callback(title, section, pagenotexist);
			return false;
		});
		node.appendChild(tmpNode);
	});
};

// Keep this synchronized with {{delh}}
Twinkle.close.codes = wgULS({
	'请求无效': {
		'ir': {
			label: '请求无效',
			action: 'keep'
		},
		'rep': {
			label: '重复提出，无效',
			action: 'keep'
		},
		'commons': {
			label: '应在维基共享资源提请',
			action: 'keep'
		},
		'ne': {
			label: '目标页面或档案不存在，无效',
			action: 'keep'
		}
	},
	'保留': {
		'k': {
			label: '保留',
			action: 'keep'
		},
		'sk': {
			label: '快速保留',
			action: 'keep'
		},
		'tk': {
			label: '暂时保留',
			action: 'keep'
		},
		'rr': {
			label: '请求理由消失',
			action: 'keep'
		},
		'dan': {
			label: '删后重建',
			action: 'keep'
		}
	},
	'删除': {
		'd': {
			label: '删除',
			action: 'del',
			selected: true
		},
		'ic': {
			label: '图像因侵权被删',
			action: 'del'
		},
		'nc': {
			label: '无共识',
			action: 'del'
		}
	},
	'快速删除': {
		'sd': {
			label: '快速删除',
			action: 'del'
		},
		'lssd': {
			label: '无来源或版权资讯，快速删除',
			action: 'del'
		},
		'svg': {
			label: '已改用SVG图形，快速删除',
			action: 'del'
		},
		'nowcommons': {
			label: '维基共享资源已提供，快速删除',
			action: 'del'
		},
		'drep': {
			label: '多次被删除，条目锁定',
			action: 'del'
		}
	},
	'转移至其他维基计划': {
		'twc': {
			label: '转移至维基共享资源',
			action: 'noop'
		},
		'twp': {
			label: '转移至维基百科',
			action: 'noop'
		},
		'twn': {
			label: '转移至维基新闻',
			action: 'noop'
		},
		'tws': {
			label: '转移至维基文库',
			action: 'noop'
		},
		'twb': {
			label: '转移至维基教科书',
			action: 'noop'
		},
		'twq': {
			label: '转移至维基语录',
			action: 'noop'
		},
		'twt': {
			label: '转移至维基词典',
			action: 'noop'
		},
		'two': {
			label: '转移至其他维基计划',
			action: 'noop'
		}
	},
	'其他处理方法': {
		'c': {
			label: '转交侵权',
			action: 'noop'
		},
		'r': {
			label: '重定向',
			action: 'noop'
		},
		'cr': {
			label: '分类重定向',
			action: 'noop'
		},
		'm': {
			label: '移动',
			action: 'noop'
		},
		'merge': {
			label: '并入',
			action: 'noop'
		}
	}
}, {
	'請求無效': {
		'ir': {
			label: '請求無效',
			action: 'keep'
		},
		'rep': {
			label: '重複提出，無效',
			action: 'keep'
		},
		'commons': {
			label: '應在維基共享資源提請',
			action: 'keep'
		},
		'ne': {
			label: '目標頁面或檔案不存在，無效',
			action: 'keep'
		}
	},
	'保留': {
		'k': {
			label: '保留',
			action: 'keep'
		},
		'sk': {
			label: '快速保留',
			action: 'keep'
		},
		'tk': {
			label: '暫時保留',
			action: 'keep'
		},
		'rr': {
			label: '請求理由消失',
			action: 'keep'
		},
		'dan': {
			label: '刪後重建',
			action: 'keep'
		}
	},
	'刪除': {
		'd': {
			label: '刪除',
			action: 'del',
			selected: true
		},
		'ic': {
			label: '圖像因侵權被刪',
			action: 'del'
		},
		'nc': {
			label: '無共識',
			action: 'del'
		}
	},
	'快速刪除': {
		'sd': {
			label: '快速刪除',
			action: 'del'
		},
		'lssd': {
			label: '無來源或版權資訊，快速刪除',
			action: 'del'
		},
		'svg': {
			label: '已改用SVG圖形，快速刪除',
			action: 'del'
		},
		'nowcommons': {
			label: '維基共享資源已提供，快速刪除',
			action: 'del'
		},
		'drep': {
			label: '多次被刪除，條目鎖定',
			action: 'del'
		}
	},
	'轉移至其他維基計劃': {
		'twc': {
			label: '轉移至維基共享資源',
			action: 'noop'
		},
		'twp': {
			label: '轉移至維基百科',
			action: 'noop'
		},
		'twn': {
			label: '轉移至維基新聞',
			action: 'noop'
		},
		'tws': {
			label: '轉移至維基文庫',
			action: 'noop'
		},
		'twb': {
			label: '轉移至維基教科書',
			action: 'noop'
		},
		'twq': {
			label: '轉移至維基語錄',
			action: 'noop'
		},
		'twt': {
			label: '轉移至維基詞典',
			action: 'noop'
		},
		'two': {
			label: '轉移至其他維基計劃',
			action: 'noop'
		}
	},
	'其他處理方法': {
		'c': {
			label: '轉交侵權',
			action: 'noop'
		},
		'r': {
			label: '重定向',
			action: 'noop'
		},
		'cr': {
			label: '分類重定向',
			action: 'noop'
		},
		'm': {
			label: '移動',
			action: 'noop'
		},
		'merge': {
			label: '併入',
			action: 'noop'
		}
	}
});

Twinkle.close.callback = function twinklecloseCallback(title, section, noop) {
	var Window = new Morebits.simpleWindow(400, 150);
	Window.setTitle(wgULS('关闭删除表决 \u00B7 ', '關閉刪除表決 \u00B7 ') + title);
	Window.setScriptName('Twinkle');
	Window.addFooterLink(wgULS('Twinkle帮助', 'Twinkle幫助'), 'w:WP:TW/DOC#close');

	var form = new Morebits.quickForm(Twinkle.close.callback.evaluate);

	form.append({
		type: 'select',
		label: wgULS('处理结果：', '處理結果：'),
		name: 'sub_group',
		event: Twinkle.close.callback.change_code
	});

	form.append({
		type: 'input',
		name: 'remark',
		label: wgULS('补充说明：', '補充說明：')
	});

	form.append({
		type: 'checkbox',
		list: [
			{
				label: wgULS('只关闭讨论，不进行其他操作', '只關閉討論，不進行其他操作'),
				value: 'noop',
				name: 'noop',
				checked: noop
			}
		]
	});

	form.append({ type: 'submit' });

	var result = form.render();
	Window.setContent(result);
	Window.display();

	var sub_group = result.getElementsByTagName('select')[0]; // hack

	var resultData = {
		title: title,
		section: parseInt(section),
		noop: noop
	};
	$(result).data('resultData', resultData);
	// worker function to create the combo box entries
	var createEntries = function(contents, container) {
		$.each(contents, function(itemKey, itemProperties) {
			var key = typeof itemKey === 'string' ? itemKey : itemProperties.value;

			var elem = new Morebits.quickForm.element({
				type: 'option',
				label: key + '：' + itemProperties.label,
				value: key,
				selected: itemProperties.selected
			});
			var elemRendered = container.appendChild(elem.render());
			$(elemRendered).data('messageData', itemProperties);
		});
	};

	$.each(Twinkle.close.codes, function(groupLabel, groupContents) {
		var optgroup = new Morebits.quickForm.element({
			type: 'optgroup',
			label: groupLabel
		});
		optgroup = optgroup.render();
		sub_group.appendChild(optgroup);
		// create the options
		createEntries(groupContents, optgroup);
	});

	var evt = document.createEvent('Event');
	evt.initEvent('change', true, true);
	result.sub_group.dispatchEvent(evt);
};

Twinkle.close.callback.change_code = function twinklecloseCallbackChangeCode(e) {
	var resultData = $(e.target.form).data('resultData');
	var messageData = $(e.target).find('option[value="' + e.target.value + '"]').data('messageData');
	var noop = e.target.form.noop;
	if (resultData.noop || messageData.action === 'noop') {
		noop.checked = true;
		noop.disabled = true;
	} else {
		noop.checked = false;
		noop.disabled = false;
	}
};

Twinkle.close.callback.evaluate = function twinklecloseCallbackEvaluate(e) {
	var code = e.target.sub_group.value;
	var resultData = $(e.target).data('resultData');
	var messageData = $(e.target.sub_group).find('option[value="' + code + '"]').data('messageData');
	var noop = e.target.noop.checked;
	var params = {
		title: resultData.title,
		code: code,
		remark: e.target.remark.value,
		section: resultData.section,
		messageData: messageData
	};

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init(e.target);

	Morebits.wiki.actionCompleted.notice = '操作完成';

	if (noop || messageData.action === 'noop') {
		Twinkle.close.callbacks.talkend(params);
	} else {
		switch (messageData.action) {
			case 'del':
				Twinkle.close.callbacks.del(params);
				break;
			case 'keep':
				var wikipedia_page = new Morebits.wiki.page(params.title, wgULS('移除删除表决模板', '移除刪除表決模板'));
				wikipedia_page.setCallbackParameters(params);
				wikipedia_page.load(Twinkle.close.callbacks.keep);
				break;
			default:
				alert(wgULS('Twinkle.close：未定义 ', 'Twinkle.close：未定義 ') + code);

		}
	}
};

Twinkle.close.callbacks = {
	del: function (params) {
		Morebits.wiki.addCheckpoint();

		var page = new Morebits.wiki.page(params.title, wgULS('删除页面', '刪除頁面'));

		page.setEditSummary('[[Special:PermanentLink/' + mw.config.get('wgRevisionId') + '|' + wgULS('删除表决通过', '刪除表決通過') + ']]' + Twinkle.getPref('deletionSummaryAd'));
		page.deletePage(function() {
			page.getStatusElement().info('完成');
			Twinkle.close.callbacks.talkend(params);
		});
		Morebits.wiki.removeCheckpoint();
	},
	keep: function (pageobj) {
		var statelem = pageobj.getStatusElement();

		if (!pageobj.exists()) {
			statelem.error(wgULS('页面不存在，可能已被删除', '頁面不存在，可能已被刪除'));
			return;
		}

		var text = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();

		var pagetitle = mw.Title.newFromText(params.title);
		/* if (pagetitle.getNamespaceId() % 2 === 0) {
			var talkpagetitle = new mw.Title(pagetitle.getMainText(), pagetitle.getNamespaceId() + 1);
			var talkpage = new Morebits.wiki.page(talkpagetitle.toString(), '标记讨论页');
			var vfdkept = '{{vfd-kept|' + mw.config.get('wgPageName').split('/').slice(2).join('/') + '|' + params.messageData.label + '}}\n';
			talkpage.setPrependText(vfdkept);
			talkpage.setEditSummary('[[' + mw.config.get('wgPageName') + ']]：' + params.messageData.label + Twinkle.getPref('summaryAd'));
			talkpage.setCreateOption('recreate');
			talkpage.prepend();
		} */

		var newtext = text.replace(/\{\{(vfd)(?:\|[^{}]*?)?\}\}\n*/gi, '');
		if (newtext === text) {
			statelem.warn(wgULS('未找到删除表决模板，可能已被移除', '未找到刪除表決模板，可能已被移除'));
			Twinkle.close.callbacks.talkend(params);
			return;
		}
		var editsummary = wgULS('删除表决关闭：[[', '刪除表決關閉：[[') + mw.config.get('wgPageName') + wgULS(']]', ']]');

		pageobj.setPageText(newtext);
		pageobj.setEditSummary(editsummary + Twinkle.getPref('summaryAd'));
		pageobj.setCreateOption('nocreate');
		pageobj.save(Twinkle.close.callbacks.keepComplete);
	},
	keepComplete: function (pageobj) {
		var params = pageobj.getCallbackParameters();
		Twinkle.close.callbacks.talkend(params);
	},

	talkend: function (params) {
		var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), wgULS('关闭讨论', '關閉討論'));
		wikipedia_page.setCallbackParameters(params);
		wikipedia_page.setPageSection(params.section);
		wikipedia_page.load(Twinkle.close.callbacks.saveTalk);
	},
	saveTalk: function (pageobj) {
		var statelem = pageobj.getStatusElement();
		var text = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();

		if (text.indexOf('{{discussion top') !== -1) {
			statelem.error(wgULS('讨论已被关闭', '討論已被關閉'));
			return;
		}

		var sbegin = text.indexOf('<section begin=backlog />') !== -1;
		var send = text.indexOf('<section end=backlog />') !== -1;
		text = text.replace('\n<section begin=backlog />', '');
		text = text.replace('\n<section end=backlog />', '');

		var bar = text.split('\n----\n');
		var split = bar[0].split('\n');

		text = split[0] + '\n{{discussion top}}\n' + split.slice(1).join('\n');
		text += "\n----\n: '''" + (params.messageData.action === 'del' ? wgULS('已删除', '已刪除') : wgULS('未删除', '未刪除')) + "'''";
		if (['d', 'k'].indexOf(params.messageData.code) === -1) {
			text += '：' + params.messageData.label;
		}
		if (params.remark) {
			text += '，' + params.remark;
		} else {
			text += '。';
		}
		text += '--~~~~\n{{discussion bottom}}';

		if (bar[1]) {
			text += '\n----\n' + bar.slice(1).join('\n----\n');
		}
		if (send) {
			text += '\n<section end=backlog />';
		}
		if (sbegin) {
			// guaranteed to be at tne end?
			text += '\n<section begin=backlog />';
		}

		pageobj.setPageText(text);
		pageobj.setEditSummary('/* ' + params.title + ' */ ' + params.messageData.label + Twinkle.getPref('summaryAd'));
		pageobj.setCreateOption('nocreate');
		pageobj.save(Twinkle.close.callbacks.disableLink);
	},

	disableLink: function (pageobj) {
		var params = pageobj.getCallbackParameters();
		$('strong a[href=#' + params.section + '] span').css('color', 'grey');
	}
};

})(jQuery);


// </nowiki>
