var db = {
    'pageDatas': [],
    'data': [],

    get: function () {
        return db.data;
    },
    set: function (newUser) {
        db.data.push(newUser);
    },
    PageClear: function () {
        db.pageDatas = [];
    },

    getPage: function (stand) {
        var tempData = {
            index: '',
            users: []
        };

        var standIndex = 0;
        var dataIndex = 0;
        var dataLength = db.data.length;
        var standLength = stand;

        while (true) {

            if (dataIndex == dataLength) {
                db.pageDatas.push(tempData);
                break;
            }

            if (standIndex == standLength) {
                db.pageDatas.push(tempData);
                standIndex = 0;
                tempData = {
                    index: '',
                    users: []
                };
            }

            var userTemp = db.data[dataIndex];
            userTemp.userIndex = dataIndex + 1;

            tempData.index = Math.floor(dataIndex / stand) + 1;
            tempData.users.push(userTemp);

            dataIndex++;
            standIndex++;

        }

        return db.pageDatas;
    },
    getPageUsers: function (current) {
        return db.pageDatas[current].users;
    }
};

// User Management Modal hide Event
$('#userManagementModal').on('hidden.bs.modal', function () {
    $('.container.adduser').fadeOut();
    $('#userAddButton').show();
    $('#userCancelButton').hide();
    onInitUserValid();
});

// onload
$scope.userInfo = {};
$scope.currentTab = null;
$scope.currentPage = 0;

$scope.pages = db.getPage(5);
$scope.users = db.getPageUsers($scope.currentPage);


$scope.onOpenRegister = function () {
    $('.container.adduser').fadeIn();
    $('#userAddButton').hide();
    $('#userCancelButton').show();
    onInitUserInfo();
}

$scope.onCloseRegister = function () {
    $('.container.adduser').fadeOut();
    $('#userAddButton').show();
    $('#userCancelButton').hide();
    onInitUserValid();
}

$scope.onSearchFilterUser = function () {
    var value = $('#userFilter').val();
    console.log($scope.searchText);
}

$scope.onChangePage = function (index) {
    $scope.currentPage = index;
    $scope.users = db.pageDatas[index].users;
}

$scope.onEditUser = function (index) {
    console.log(index);
}

$scope.onDeleteUser = function (index) {
    console.log(index);
}

$scope.usersBarCode = function () {
    if ($scope.currentTab == 'BarCode') {
        onMakeBarCode();
        return $scope.users;
    }
}

$scope.onRegisterButton = function (form) {

}

$scope.onClickTab = function (tabName) {
    if (tabName == 'BarCode') {
        $scope.currentTab = tabName;

        onMakeBarCode();
    }
    if (tabName == 'List') {
        $scope.currentTab = tabName;

    }
}

$scope.onValidation = function (field) {
    if (field == 'name') {
        $scope.registerForm.username.$setValidity("duplicate", onValidateName($scope.userInfo.name));
        return;
    }

    if (field == 'email') {
        $scope.registerForm.useremail.$setValidity("emailvalid", onValidateEmail($scope.userInfo.email));
        return;
    }

    if (field == 'phone') {
        $scope.registerForm.userphone.$setValidity("phonevalid", onValidatePhone($scope.userInfo.phone));
        return;
    }
}

//$('#popupModal').modal('show');
$scope.onRegisterFormSubmit = function (form) {

    if (!onValidateName($scope.userInfo.name)) {
        alert('Check Form');
        return;
    }

    if (!onValidateEmail($scope.userInfo.email)) {
        alert('Check Form');
        return;
    }

    if (!onValidatePhone($scope.userInfo.phone)) {
        alert('Check Form');
        return;
    }
    /*
    $http.post('/pms/addUserData', {
        username: $scope.userInfo.name,
        useremail: $scope.userInfo.email,
        userphone: $scope.userInfo.phone
    })
        .success(function (data, status, headers, config) {
            onInitUserInfo();
            onInitUserValid();

            onLoadPageUser();
        })
        .error(function (data, status, header, config) {

        });
    */

    var data = {
        userName: $scope.userInfo.name,
        userEmail: $scope.userInfo.email,
        userPhone: $scope.userInfo.phone
    };

    db.set(data);

    onInitUserInfo();
    onInitUserValid();

    onLoadPageUser();

}
function onLoadPageUser() {
    db.PageClear();
    $scope.pages = db.getPage(5);
    $scope.users = db.getPageUsers($scope.currentPage);
}

function onInitUserInfo() {
    $scope.userInfo.name = undefined;
    $scope.userInfo.email = undefined;
    $scope.userInfo.phone = undefined;
    $scope.userInfo.agree = false;
}

function onInitUserValid() {
    $scope.registerForm.username.$setValidity('duplicate', true);
    $scope.registerForm.useremail.$setValidity('emailvalid', true);
    $scope.registerForm.userphone.$setValidity('phonevalid', true);
}

function onValidateInput(txt) {
    var regex = /^[a-zA-Z0-9@]+$/;

    return regex.test(txt);
}
function onValidateName(name) {
    if (name === undefined) {
        return true;
    }

    for (var index = 0; index < $scope.users.length; index++) {

        if (name == $scope.users[index].userName) {
            return false;
        }
    }
    return true;
}

function onValidateEmail(email) {
    if (email === undefined) {
        return true;
    }

    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
}

function onValidatePhone(phone) {
    if (phone === undefined) {
        return true;
    }

    var regex = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    return regex.test(phone);
}

function onMakeBarCode() {
    for (var index = 0; index < $scope.users.length; index++) {

        var name = $scope.users[index].userName;
        var id = '#' + name;
        $(id).JsBarcode(name, { width: 1, height: 40, displayValue: false });
    }
}