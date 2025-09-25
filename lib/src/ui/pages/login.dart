import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:asistencia-gpa/src/services/obtener_IMEI.dart';
import 'package:asistencia-gpa/src/ui/constants/colores.dart';
import 'package:asistencia-gpa/src/ui/pages/pagina_principal.dart';
import 'package:asistencia-gpa/src/ui/widgets/dialogo_informacion.dart';
import 'package:asistencia-gpa/src/ui/widgets/dialogo_cargando.dart';

import '../../services/autenticacion.dart';

class Login extends StatefulWidget {
  Login({this.auth});

  final BaseAuth? auth;

  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final _formKey = new GlobalKey<FormState>();
  FirebaseDatabase db = new FirebaseDatabase();
  late DatabaseReference _empIdRef, _userRef;

  String? _username;
  String? _password;
  String _errorMessage = "";
  late User _user;
  bool formSubmit = false;
  late Auth authObject;

  @override
  void initState() {
    _userRef = db.reference().child("users");
    _empIdRef = db.reference().child('EmployeeID');
    authObject = new Auth();

    super.initState();
  }

  bool validateAndSave() {
    final form = _formKey.currentState;
    if (form?.validate() ?? false) {
      form!.save();
      setState(() {
        _errorMessage = "";
      });
      return true;
    }
    return false;
  }

  void validateAndSubmit() async {
    if (validateAndSave()) {
      FocusScope.of(context).unfocus();
      onLoadingDialog(context);
      String email;
      try {
        _empIdRef.child(_username!).once().then((DatabaseEvent event) {
          final snapshot = event.snapshot;
          if (snapshot.value == null) {
            print("popped");
            _errorMessage = "¡Datos de inicio de sesión no válidos!";
            Navigator.pop(context);
          } else {
            email = snapshot.value as String;
            loginUser(email);
          }
        });
      } catch (e) {
        print(e);
      }
    }
  }

  Future<List> checkForSingleSignOn(User _user) async {
    DataSnapshot dataSnapshot =
        (await _userRef.child(_user.uid).once()).snapshot;

    if (dataSnapshot != null) {
      var uuid = (dataSnapshot.value as Map)["UUID"];
      List listOfDetails = await getDeviceDetails();

      if (uuid != null) {
        if (listOfDetails[2] == uuid)
          return List.from([true, listOfDetails[2], true]);
        else
          return List.from([false, listOfDetails[2], true]);
      }
      return List.from([true, listOfDetails[2], false]);
    }
    return List.from([false, null, false]);
  }

  void loginUser(String email) async {
    if (_password != null) {
      try {
        _user = await authObject.signIn(email, _password!);
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => HomePage(user: _user)),
        );
      } catch (e) {
        Navigator.of(context).pop();
        print("Error" + e.toString());
        setState(() {
          _errorMessage = e.toString();
          _formKey.currentState?.reset();
        });
      }
    } else {
      setState(() {
        _errorMessage = "Datos inválidos!!!!!";
        _formKey.currentState?.reset();
        Navigator.of(context).pop();
      });
    }
  }

  Widget radioButton(bool isSelected) => Container(
        width: 16.0,
        height: 16.0,
        padding: EdgeInsets.all(2.0),
        decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(width: 2.0, color: Colors.black)),
        child: isSelected
            ? Container(
                width: double.infinity,
                height: double.infinity,
                decoration:
                    BoxDecoration(shape: BoxShape.circle, color: Colors.black),
              )
            : Container(),
      );

  Widget horizontalLine() => Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.0),
        child: Container(
          width: ScreenUtil().setWidth(120),
          height: 1.0,
          color: Colors.black26.withOpacity(.2),
        ),
      );

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations(
        [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);
    ScreenUtil.init(context, designSize: Size(750, 1334), minTextAdapt: true);
    return new Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: new AssetImage('assets/back.jpg'),
            fit: BoxFit.fill,
          ),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: <Widget>[
            SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.only(left: 28.0, right: 28.0, top: 150.0),
                child: Column(
                  children: <Widget>[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: <Widget>[
                        Image.asset(
                          "assets/logo/logo.png",
                          width: ScreenUtil().setWidth(250),
                          height: ScreenUtil().setHeight(220),
                        ),
                        SizedBox(
                          width: ScreenUtil().setWidth(40),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            mainAxisSize: MainAxisSize.min,
                            children: <Widget>[
                              Text("Geo Asistencia",
                              textAlign: TextAlign.center,
                                  style: TextStyle(
                                      fontFamily: "Poppins-Bold",
                                      color: appbarcolor2,
                                      fontSize: ScreenUtil().setSp(50),
                                      letterSpacing: .6,
                                      fontWeight: FontWeight.bold)),
                              Text("y Sistema de Gestión de RRHH",
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      fontFamily: "Poppins-Bold",
                                      color: Colors.white60,
                                      fontSize: ScreenUtil().setSp(25),
                                      letterSpacing: 0.2,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        )
                      ],
                    ),
                    SizedBox(
                      height: ScreenUtil().setHeight(90),
                    ),
                    formCard(),
                    SizedBox(height: ScreenUtil().setHeight(40)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        InkWell(
                          child: Container(
                            width: ScreenUtil().setWidth(330),
                            height: ScreenUtil().setHeight(100),
                            decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [
                                  splashScreenColorBottom,
                                  Color(0xFF6078ea)
                                ]),
                                borderRadius: BorderRadius.circular(6.0),
                                boxShadow: [
                                  BoxShadow(
                                      color: Color(0xFF6078ea).withOpacity(.3),
                                      offset: Offset(0.0, 8.0),
                                      blurRadius: 8.0)
                                ]),
                         child: Container(
                                    decoration: BoxDecoration(
                                      color: Color(0xFF810207), // fondo rojo oscuro
                                      border: Border.all(color: Colors.white, width: 2.0), // borde blanco
                                      borderRadius: BorderRadius.circular(8.0), // opcional: bordes redondeados
                                    ),
                                    child: Material(
                                      color: Colors.transparent, // importante para ver el color del Container
                                      child: InkWell(
                                        onTap: validateAndSubmit,
                                        borderRadius: BorderRadius.circular(8.0), // igual al container si usas bordes redondeados
                                        child: Center(
                                          child: Padding(
                                            padding: EdgeInsets.symmetric(vertical: 12.0), // espacio interno
                                            child: Text(
                                              "Iniciar",
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontFamily: "Poppins-Bold",
                                                fontSize: 18,
                                                letterSpacing: 1.0,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                          ),
                        )
                      ],
                    ),
                    SizedBox(
                      height: ScreenUtil().setHeight(40),
                    ),
                    SizedBox(
                      height: ScreenUtil().setHeight(40),
                    ),
                    SizedBox(
                      height: ScreenUtil().setHeight(30),
                    )
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget formCard() {
    return new Container(
      width: double.infinity,
      height: 260,
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8.0),
          boxShadow: [
            BoxShadow(
                color: Colors.black12,
                offset: Offset(0.0, 15.0),
                blurRadius: 15.0),
            BoxShadow(
                color: Colors.black12,
                offset: Offset(0.0, -10.0),
                blurRadius: 10.0),
          ]),
      child: Padding(
        padding: EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Center(
                  child: Text(
                    "Inicio de sesión",
                    style: TextStyle(
                      fontSize: ScreenUtil().setSp(45),
                      fontFamily: "Poppins-Bold",
                      letterSpacing: .6,
                    ),
                  ),
                )
              ,
              SizedBox(
                height: ScreenUtil().setHeight(30),
              ),
              Container(
                height: 60,
                child: TextFormField(
                  decoration: InputDecoration(
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: dashBoardColor),
                      ),
                      icon: Icon(
                        Icons.person,
                        color: dashBoardColor,
                      ),
                      hintText: "ID de empleado",
                      hintStyle: TextStyle(color: Colors.grey, fontSize: 15.0)),
                  validator: (value) => value == null || value.isEmpty
                      ? 'El ID de usuario no puede estar vacío'
                      : null,
                  onSaved: (value) => _username = value?.trim(),
                ),
              ),
              Container(
                height: 60,
                child: TextFormField(
                  obscureText: true,
                  decoration: InputDecoration(
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: dashBoardColor),
                      ),
                      icon: Icon(
                        Icons.lock,
                        color: dashBoardColor,
                      ),
                      hintText: "Contraseña",
                      hintStyle: TextStyle(color: Colors.grey, fontSize: 15.0)),
                  validator: (value) => value == null || value.isEmpty
                      ? 'La contraseña no puede estar vacía'
                      : null,
                  onChanged: (value) => _password = value,
                ),
              ),
              Text(
                _errorMessage,
                style: TextStyle(color: Colors.red),
              ),
             ],
          ),
        ),
      ),
    );
  }
}
