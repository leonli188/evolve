Ext.define('Order', {
    extend: 'Ext.data.Model',
    fields: [{name: "order_id"},
             {name: "order_number"},
             {name: "order_item_id"},
             {name: "order_supplier_code"},
             {name: "order_supplier_name"},
             {name: "order_qty"},
             {name: "order_buyer"},
             {name: "qty"},
             {name: "unit"},
             {name: "warehouse_code"},
             {name: "price",type:"float"},
             {name: "qty_return"},
             {name: "code"},
             {name: "name"},
             {name: "description"}]
});

var orderStore = Ext.create('Ext.data.Store', {
    model: 'Order',
    groupField: 'order_number',
    proxy: {
        type: 'ajax',
        reader: 'json',
        url: homePath+'/public/erp/stock_return/getcanbereturnlist'
    },
    listeners: {
    	beforeload: loadOrder
    }
});

function loadOrder(){
	var key = Ext.getCmp('search_order_key').getValue();
    
	Ext.apply(orderStore.proxy.extraParams, {
		key: key
    });
};

var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
	groupHeaderTpl: '{name}：{rows.length} 项 [采购员：{[values.rows[0].data.order_buyer]}]',
    hideGroupedHeader: true,
    id: 'orderListGrouping'
});

var orderListRowEditing = Ext.create('Ext.grid.plugin.CellEditing', {
    clicksToEdit: 1
});

function addReturnRow(items){
	var insertCnt = 0;
	
	for(var i = 0; i < items.length; i++){
		rec = items[i];

		var r = Ext.create('Items', {
			items_order_id: rec.get('order_id'),
			items_order_item_id: rec.get('order_item_id'),
			items_order_number: rec.get('order_number'),
			items_order_supplier_code: rec.get('order_supplier_code'),
			items_order_supplier_name: rec.get('order_supplier_name'),
			items_code: rec.get('code'),
	        items_qty: rec.get('qty_return'),
	        items_unit: rec.get('unit'),
	        //items_warehouse_code: rec.get('warehouse_code'),
	        items_warehouse_code: 0,
	        items_warehouse_qty: 0,
			items_price: rec.get('price'),
			items_name: rec.get('name'),
			items_description: rec.get('description')
	    });

	    itemsStore.insert(0, r);
	    
	    insertCnt++;
	}
	
	return insertCnt;
}

// 收货采购订单列表
var orderGrid = Ext.create('Ext.grid.Panel', {
	border: 0,
    id: 'orderGrid',
    columnLines: true,
    store: orderStore,
    features: [groupingFeature],
    plugins: orderListRowEditing,
    tbar: [{
    	xtype: 'textfield',
        id: 'search_order_key',
        emptyText: '关键字...',
        listeners: {
        	specialKey :function(field,e){
                if (e.getKey() == Ext.EventObject.ENTER){
                	orderStore.load();
                }
            }
        }
    }, {
    	text: '查询',
        iconCls: 'icon-search',
        handler: function(){
        	orderStore.load();
        }
    }, {
        text: '选择',
        iconCls: 'icon-ok',
        handler: function(){
        	orderListRowEditing.cancelEdit();
        	
        	var qtyChkInfo = '';// 检查退货数量
        	var itemsInsert = [];
        	
        	orderStore.each(function(rec){
        		if(qtyChkInfo == ''){
        			var qty_return = Number(rec.get('qty_return'));
            		var qty = Number(rec.get('qty'));
            		
            		if(qty_return > qty){
        				qtyChkInfo = rec.get('code') + "未清数量不足：" + qty_return + ' > ' + qty;
        			}else if(qty_return > 0){
        				itemsInsert.push(rec);
        			}
        		}
        	});
        	
        	// 数量检查结果
        	if(qtyChkInfo == ''){
        		if(itemsInsert.length > 0){
        			// 清除已添加项
            		for(var i = 0; i < itemsInsert.length; i++){
            			recInsert = itemsInsert[i];
            			
            			itemsStore.each(function(rec) {
            				if (rec.get('items_code') == recInsert.get('code')) {
                		    	itemsStore.remove(rec);
                		    }
                		});
            		}
            		
            		// 添加行
            		var qtyAdded = addReturnRow(itemsInsert);
                	
            		if(qtyAdded > 0){
            			orderWin.hide();
                		
                		itemsRowEditing.startEdit(0, 0);
            		}else{
            			Ext.MessageBox.alert('错误', '没有选择任何项目，请填写退货数量！');
            		}
        		}else{
        			Ext.MessageBox.alert('错误', '请填写退货数量！');
        		}
        	}else{
        		Ext.MessageBox.alert('错误', qtyChkInfo);
        	}
        }
    }, '->', {
        text: '刷新',
        iconCls: 'icon-refresh',
        handler: function(){
       	 	orderStore.reload();
        }
    }],
    columns: [{
        text: '订单ID',
        dataIndex: 'order_id',
        hidden: true,
        width: 50
    }, {
        text: '物料号',
        dataIndex: 'code',
        width: 100
    }, {
        text: '收货数量',
        dataIndex: 'qty',
        width: 80
    }, {
        text: '退货数量',
        dataIndex: 'qty_return',
        editor: 'numberfield',
        renderer: function(val, meta, record){
        	meta.style = 'background-color: #FFFFDF';
        	
        	return val;
        },
        width: 80
    }, {
        text: '名称',
        dataIndex: 'name',
        flex: 1
    }, {
        text: '描述',
        dataIndex: 'description',
        flex: 3
    }]
});

// 收货采购订单窗口
var orderWin = Ext.create('Ext.window.Window', {
	title: '收货采购订单列表',
	id: 'orderWin',
	height: 400,
	width: 900,
	modal: true,
	constrain: true,
	maximizable: true,
	closeAction: 'hide',
	layout: 'fit',
	tools: [{
	    type: 'refresh',
	    tooltip: 'Refresh',
	    scope: this,
	    handler: function(){orderStore.reload();}
	}],
	items: [orderGrid]
});