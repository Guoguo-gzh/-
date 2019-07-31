;
(function () {
    'use strict';

    // 事件调度器
    var es = new Vue({});

    Vue.component('task', {
        template: '#tpl-task',
        props: ['item'],
        methods: {
            action: function (name, val) {
                es.$emit(name, val);
            }
        },
    })

    var main = new Vue({
        el: '#main',
        data() {
            return {
                list: [],
                last_id: 0,
                current: {
                    id: null,
                    title: null,
                    completed: false, // 完成状态
                    desc: null,
                    showDesc: false, // 展示详情状态
                    remind: null,
                    reminded: false, // 时间提醒状态
                }
            }
        },
        // 初始化挂载时
        mounted() {
            var ds = this;
            this.list = ms.get('list') || this.list;
            this.last_id = ms.get('last_id') || this.last_id;

            setInterval(() => {
                ds.checkRemind();
            }, 1000);

            es.$on('toggle_detail', function (item) {
                if (item) {
                    ds.toggle_detail(item);
                }
            });

            es.$on('toModify', function (item) {
                if (item) {
                    ds.toModify(item);
                }
            });
            es.$on('toComplete', function (id) {
                if (id) {
                    ds.toComplete(id);
                }
            });
            es.$on('toRemove', function (id) {
                if (id) {
                    ds.toRemove(id);
                }
            });
        },
        methods: {
            merge: function () {
                // console.log('this.current:', this.current);
                // 是否有id判断是更新或添加
                var id = this.current.id;
                if (id) {
                    // 修改
                    var index = this.list.findIndex(function (item) {
                        return item.id == id;
                    });
                    Vue.set(this.list, index, Object.assign({}, this.current));
                    // console.log('this.list:', this.list);
                } else {
                    //添加
                    // 为空 返回
                    var title = this.current.title;
                    if (!title && title !== 0) {
                        return;
                    }
                    var item = Object.assign({}, this.current);
                    this.last_id++;
                    item.id = this.last_id;
                    ms.set('last_id', this.last_id);
                    this.list.push(item);
                    // console.log('this.list:', this.list);
                }
            },
            toModify: function (item) {
                this.current = Object.assign({}, item);
            },
            toComplete: function (id) {
                var index = this.list.findIndex(function (item) {
                    return item.id == id;
                });
                Vue.set(this.list[index], 'completed', !this.list[index].completed);
                // console.log('this.list:', this.list);
            },
            toRemove: function (id) {
                var index = this.list.findIndex(function (item) {
                    return item.id == id;
                });
                this.list.splice(index, 1);
            },
            next_id: function () {
                return this.list.length + 1;
            },
            // 检查时间提醒
            checkRemind: function () {
                var ds = this;
                this.list.forEach(function (item, index) {
                    if (!item.remind || item.reminded) {
                        return;
                    }
                    var alert_at = (new Date(item.remind)).getTime;
                    var now = (new Date()).getTime;

                    if (item.remind <= now) {
                        var reminded = confirm(item.title);
                        Vue.set(ds.list[index], 'reminded', reminded);

                    }
                });
            },
            toggle_detail: function (item) {
                Vue.set(item, 'showDesc', !item.showDesc);
            }
        },
        watch: {
            list: {
                deep: true,
                handler: function (n, o) {
                    if (n) {
                        ms.set('list', n);
                    } else {
                        ms.set('list', []);
                    }
                }
            }
        },
    })
})();