Vue.use(Toasted);
var tableNumber = getQuerystring('tableNumber', null);

if(tableNumber){
    defaultk = defaultk.concat(instoreOnly);
}

function getQuerystring(key, default_) {
    if (default_ == null) {
        default_ = ""
    }
    var search = unescape(location.search);
    if (search == "") {
        return default_
    }
    search = search.substr(1);
    var params = search.split("&");
    for (var i = 0; i < params.length; i++) {
        var pairs = params[i].split("=");
        if (pairs[0] == key) {
            return pairs[1]
        }
    }
    return default_
}
const VueToast = window.vueToasts ? window.vueToasts.default || window.vueToasts : window.vueToasts;
var app = new Vue({
    el: '#app',
    data: {
        chillyMap:['不辣', '微辣', '中辣', '超辣'],
        showRemark: false,
        useOldDelivery: false,
        active_el2: 'tm',
        active_el: 'tp',
        orderNumber: '',
        selected: 'first',
        options: [],
        isOutShow: false,
        showModal: false,
        showCat: false,
        dummy: '',
        paySuccess: false,
        showPayQR: 0,
        showCart: false,
        showMyPay:0,
        order: {
            diceCount: 0,
            remark: '',
            merchatId: merchatId,
            delivery: {},
            tableNumber: tableNumber,
            items: {},
            isOut: tableNumber==null || tableNumber == "",
        },
        tableNumber: tableNumber,
        receiveClass: false,
        isActive: false,
        secondCats: {},
        showSecondCats: false,
        all: myall,
        items: defaultk,
    },
    mounted: () => {

     

        $('.items').flyto({
            item: '.product',
            target: '.cart',
            button: '.add'
        })
    },
    methods: {
        saveDelivery: function(e){
            this.$cookies.set('mobile', this.order.delivery.mobile, {
                expires: 7
            });

            this.$cookies.set('address', this.order.delivery.address, {
                expires: 7
            });
        },
        gotoPay: function() {
            if (this.isEmptyObject(this.order.items)) {
                alert("你的购物车为空!");
                return
            }
            if (this.order.isOut) {
                if (this.order.delivery.mobile && this.order.delivery.address) {
                    this.$cookies.set('mobile', this.order.delivery.mobile, {
                        expires: 7
                    });
                    this.$cookies.set('address', this.order.delivery.address, {
                        expires: 7
                    })
                } else {
                    var mymobile = this.$cookies.get('mobile');
                    var myaddress = this.$cookies.get('address');
                    if(mymobile && myaddress){
                        this.order.delivery.mobile = mymobile;
                        this.order.delivery.address = myaddress;
                    }else{
                        alert("请填完整的外卖送货信息!");
                        this.isOutShow = true;
                        return
                    }
                   
                }
            } else {
                if(this.order.delivery.mobile && this.order.delivery.address){

                }else{
                    if(this.tableNumber == null ||  this.tableNumber == ""){
                        alert("请填完整的外卖送货信息!");
                        this.isOutShow = true;
                        return
                    }
                }
               
            }

            this.showCart = false;
            $('#mask').hide();

            this.showPayQR = !this.showPayQR;
            if (this.showPayQR) {
                //this.items = []
            } else {
                //this.goCat('default')
                $('#mask').hide();
            }
        },
        checkNeedShow: function() {
            this.order.tableNumber = null;

            if(this.$cookies){
                var mymobile = this.$cookies.get('mobile');
                var myaddress = this.$cookies.get('address');
                if (mymobile && myaddress) {
                    this.order.delivery.mobile = mymobile;
                    this.order.delivery.address = myaddress;
                    this.useOldDelivery = true;
                } 
            } else {
                this.isOutShow = true;
                this.showCart = false
            }
            
        },
        formatPrice(value) {
            let val = (value / 1).toFixed(2).replace('.', ',');
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        },
        onTap: function(heitem) {
            var item = $.extend({}, heitem);

            var me = item.sku;
            var self = this;
            var od = self.order;
            var items = od.items;


           

            if(item.type != undefined) {
                item.desc = item.desc.replace('粉/面', catAttr[item.cat].mytype[item.type]);
            }

            if(item.chillyLevel != undefined) {
                me += "-" + item.chillyLevel;
                item.sku = me;

                item.desc += "("+this.chillyMap[item.chillyLevel]+")"
            }
             
            if (items && items[me]) {
                heitem.qty++;
                items[me][item.pack?'packQty':'qty'] = items[me][item.pack?'packQty':'qty'] + 1
            } else {

               
                heitem.qty++;
                
                console.log(me);
                this.$set(items, me, item);

                this.$set(items[me], item.pack?'packQty':'qty', 1)

                if(!item.pack){
                    this.$set(items[me], 'packQty', 0);
                }
                
            }
        },
        foundItem: function(me){
            var found = null;
            for(var i=0; i<this.items.length; i++){
                var el = this.items[i];
                console.log(el);
                if(me.startsWith(el.sku)){
                    found = el;
                    break;
                }
            }

            return found;
        },
        onTapIncreaseOnly: function(heitem, pack) {

            var item = $.extend({}, heitem);
            var me = item.sku;
            var self = this;
            var od = self.order;
            var items = od.items;


        


            var qtyVar = pack?"packQty":'qty';
            if (items && items[me]) {
               

                var iteml = this.foundItem(me);
                iteml[qtyVar]++;
                

                items[me][qtyVar] = items[me][qtyVar] + 1
                
            } else {


                this.$set(items, me, item);

                this.$set(items[me], qtyVar, 1)
            }
        },
        decrease: function(item, pack) {
            var me = item.sku;
            var self = this;
            var od = self.order;
            var items = od.items;
            if (items && items[me]) {
                var qtyVar = pack?"packQty":'qty';
                var newValue = items[me][qtyVar] - 1;
                if (newValue >0) {
                    var iteml = this.foundItem(me);
                    iteml[qtyVar]--;
                    items[me][pack?"packQty":'qty'] = newValue
                }
            }
        },
        remove: function(me) {
            var self = this;
            var od = self.order;
            var items = od.items;
            if (items && items[me]) {
                var iteml = this.foundItem(me);
                iteml.qty -= items[me].qty;

                delete items[me];
                this.dummy = new Date()
            }
        },
        isEmptyObject: function(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    return false
                }
            }
            return true
        },
        hasProblem: function() {
            this.showPayQR = false;
            this.goCat('default')
        },
        submit: function() {
            this.receiveClass = true;
            var me = this;
            this.order['total'] = this.sumByKey(this.items);
            $.ajax({
                type: 'POST',
                url: 'http://yeech.pe.hu/RealState/index.php/api/submit',
                data: {
                    'order': this.order
                },
                dataType: 'json',
                success: function(responseData, textStatus, jqXHR) {
                  
                    me.showPayQR = true;
					me.receiveClass = false;
                    me.orderNumber = responseData.orderNumber;
                    me.paySuccess = 1;
                    me.showMyPay = 0;
                    me.$toasted.success('订单已提交成功, 请耐心等候!', {
                        duration: 6000,
                        position: 'bottom-right'
                    });

                },
                error: function(responseData, textStatus, jqXHR) {
                    me.$toasted.success('提交失败!', {
                        duration: 5000,
                        position: 'bottom-right'
                    });
                    me.showMyPay = 0;
                }
            })
        },
        showMyCart: function() {
            $("#mask").toggle();
            this.showCart = !this.showCart
        },
        chnageCat: function(catCode, showAll) {
            this.secondCats = this.all[catCode];
            this.showSecondCats = !this.showSecondCats;
            this.active_el = catCode;
            if (showAll) {
                var par = this.all[catCode];
                var items = [];
                for (k in par) {
                    console.log(par[k]);
                    items = items.concat(par[k])
                }
                this.items = items
            }
        },
        goCat: function(parent, catCode) {
            this.active_el = parent;
            this.active_el2 = parent + catCode;
            setTimeout(function() {
                $('.items').flyto({
                    item: '.product',
                    target: '.cart',
                    button: '.add'
                })
            }, 500);
            if (catCode) {
                this.items = this.all[parent][catCode]
            } else {
                this.items = this.all[parent]
            }
            $('#mask').show();
            this.showCart = false
        },
        toUrl: function(key) {
            var imageKey = key.split('-')[0];
            return "images/menu_item/" + imageKey + ".jpg"
        },
        
        getTotal:function(object){
            var sum = this.sumByKey(object);
            if(sum>20){
                return sum;
            }else{
                return sum+1;
            }
        },
        sumByKey: function(object) {
            var sum = 0;
            for (k in object) {
                var item = object[k];
                sum += (item['qty']+item['packQty']) * item['price']
                
            }
            
            return sum;
        },
        sumByKeyOnly: function(object, key, key2) {
            var sum = 0;
            for (k in object) {
                var item = object[k];
                sum += item[key]
                if(key2){
                    sum += item[key2];
                }
            }
            return sum
        },

        getCatAttrById: function(item){

            console.log(catAttr[item.cat]);
            if(catAttr[item.cat] == undefined){
                console.log(item.sku);
                return [];
            }
            return catAttr[item.cat].mytype;
        }
    }
});
Vue.component('modal', {
    template: '#modal-template'
})