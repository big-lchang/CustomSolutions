angular.module('OrderCloud-ProductReport', []);

angular.module('OrderCloud-ProductReport')

    .factory('ProductReport', ['$resource', '$451', 'Report', function($resource, $451, Report) {
        var service = {
            getOrderQuantity: _getOrderQuantity
        };
        return service;

        function _getOrderQuantity(productID, success) {
            var report;
            Report.query(function(list) {
                if (list.length == 0) {
                    createReport(productID, function(result) {
                        getResult(result);
                    });
                }
                else {
                    var report = null;
                    angular.forEach(list, function(r) {
                        report = (r.Type == 'LineItem' && r.Name == ('hidden_' + productID)) ? r : report;
                    });
                    if (!report) {
                        createReport(productID, function(result) {
                            getResult(result);
                        });
                    }
                    else {
                        getResult(report);
                    }
                }
            });

            function getResult(report) {
                $resource($451.api('report/:id/download'), { id: '@id' }).get({ id: report.ID, page: 1, pagesize: 100 }).$promise.then(
                    function (data) {
                        var count = 0;
                        angular.forEach(data.Data, function(item) {
                            count += +(item.Quantity);
                        });
                        success(count);
                    },
                    function (ex) {
                        console.log('download failed');
                        console.log(ex);
                    }
                );
            }
        }

        function createReport(productID, success) {
            Report.get('LineItem',
                function(data) {
                    var report = data;
                    report.Product = productID;
                    report.Name = "hidden_" + productID;
                    report.SelectedColumns = ['Quantity'];
                    Report.save(report,
                        function(r) {
                            success(r);
                        },
                        function(ex) {
                            console.log('save failed');
                            console.log(ex);
                        }
                    );
                },
                function(ex) {
                    console.log('get failed');
                    console.log(ex);
                }
            );
        }
    }])
;