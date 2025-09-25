import 'package:easy_geofencing/enums/geofence_status.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:asistencia-gpa/src/models/oficina.dart';
import 'package:asistencia-gpa/src/ui/widgets/dialogo_informacion.dart';
import 'package:location/location.dart';

import 'fecha_actual.dart';
import 'obtener_asistencia.dart';

String findLatestIn(listOfAttendanceIterable) {
  List finalList = listOfAttendanceIterable
      .where((attendance) => attendance.toString().substring(0, 2) == "in")
      .toList();

  if (finalList.length == 0) return "";

  finalList.sort((a, b) {
    String time1 = a.toString().split("-")[1];
    String time2 = b.toString().split("-")[1];
    return time1.compareTo(time2);
  });

  return finalList.last.toString().split("-")[1];
}

String findLatestOut(listOfAttendanceIterable) {
  List finalList = listOfAttendanceIterable
      .where((attendance) => attendance.toString().substring(0, 3) == "out")
      .toList();

  if (finalList.length == 0) return "";

  finalList.sort((a, b) {
    String time1 = a.toString().split("-")[1];
    String time2 = b.toString().split("-")[1];
    return time1.compareTo(time2);
  });

  return finalList.last.toString().split("-")[1];
}

String findFirstIn(listOfAttendanceIterable) {
  List finalList = listOfAttendanceIterable
      .where((attendance) => attendance.toString().substring(0, 2) == "in")
      .toList();

  if (finalList.length == 0) return "";
  finalList.sort((a, b) {
    String time1 = a.toString().split("-")[1];
    String time2 = b.toString().split("-")[1];
    return time1.compareTo(time2);
  });

  return finalList.first.toString().split("-")[1];
}

String findFirstOut(listOfAttendanceIterable) {
  List finalList = listOfAttendanceIterable
      .where((attendance) => attendance.toString().substring(0, 3) == "out")
      .toList();

  if (finalList.length == 0) return "";

  finalList.sort((a, b) {
    String time1 = a.toString().split("-")[1];
    String time2 = b.toString().split("-")[1];
    return time1.compareTo(time2);
  });

  return finalList.first.toString().split("-")[1];
}

bool checkSuccessiveIn(listOfAttendanceIterable) {
  if (listOfAttendanceIterable.length > 0) {
    String lastOut = findLatestOut(listOfAttendanceIterable);
    String lastIn = findLatestIn(listOfAttendanceIterable);

    if (lastIn == "" || (lastOut != "" && lastIn.compareTo(lastOut) <= 0))
      return true;
    else
      return false;
  }
  return true;
}

bool checkSuccessiveOut(listOfAttendanceIterable) {
  if (listOfAttendanceIterable.length > 0) {
    String lastOut = findLatestOut(listOfAttendanceIterable);
    String lastIn = findLatestIn(listOfAttendanceIterable);

    if (lastOut == "" || (lastIn != "" && lastOut.compareTo(lastIn) <= 0))
      return true;
    else
      return false;
  }
  return true;
}

void markInAttendance(
    BuildContext context,
    Office office,
    LocationData currentPosition,
    User user,
    GeofenceStatus geoFenceStatus) async {
  Future.delayed(Duration(seconds: 1), () {
    DateTime dateToday = getTodayDate();
    AttendanceDatabase.getAttendanceOfParticularDateBasedOnUID(
            user.uid, dateToday)
        .then((snapshot) {
      Navigator.of(context, rootNavigator: true).pop('dialog');
      bool isFeasible = true;
      String errorMessage = "";
      if (snapshot != null) {
        var listOfAttendanceIterable = snapshot.keys;
        if (listOfAttendanceIterable.length > 0 &&
            !checkSuccessiveIn(listOfAttendanceIterable)) {
          isFeasible = false;
          errorMessage = "No se permite marcar sucesivamente";
        }
      }

      if (isFeasible && geoFenceStatus == GeofenceStatus.enter) {
        AttendanceDatabase.markAttendance(user.uid, dateToday, office, "in")
            .then((_) {
          showDialogTemplate(
              context,
              "Información de asistencia",
              "Marcado \nEstado: ${geoFenceStatus.toString()}",
              "assets/gif/tick.gif",
              Color.fromRGBO(51, 205, 187, 1.0),
              "Bien");
        });
      } else {
        if (isFeasible) errorMessage = "¡Fuera de la ubicación asignada!";
        showDialogTemplate(
            context,
            "Información de asistencia",
            "$errorMessage\nEstado: ${geoFenceStatus.toString()}",
            "assets/gif/close.gif",
            Color.fromRGBO(200, 71, 108, 1.0),
            "Oops!");
      }
    });
  });
}

void markOutAttendance(
    BuildContext context,
    Office office,
    LocationData currentPosition,
    User user,
    GeofenceStatus geoFenceStatus) async {
  Future.delayed(Duration(seconds: 1), () {
    DateTime dateToday = getTodayDate();
    AttendanceDatabase.getAttendanceOfParticularDateBasedOnUID(
            user.uid, dateToday)
        .then((snapshot) {
      Navigator.of(context, rootNavigator: true).pop('dialog');
      bool isFeasible = true;
      String errorMessage = "";

      if (snapshot != null) {
        var listOfAttendanceIterable = snapshot.keys;
        if (listOfAttendanceIterable.length > 0 &&
            !checkSuccessiveOut(listOfAttendanceIterable)) {
          isFeasible = false;
          errorMessage = "No se permite marcar sucesivamente";
        } else if (listOfAttendanceIterable.length == 0) {
          isFeasible = false;
          errorMessage = "¡No se encontró ninguna entrada!";
        }
      } else {
        isFeasible = false;
        errorMessage = "¡No se encontró ninguna entrada!";
      }

      if (isFeasible && GeofenceStatus.enter == geoFenceStatus) {
        AttendanceDatabase.markAttendance(user.uid, dateToday, office, "out")
            .then((_) {
          showDialogTemplate(
              context,
              "Información de asistencia",
              "Marcada \nEstado: ${geoFenceStatus.toString()}",
              "assets/gif/tick.gif",
              Color.fromRGBO(51, 205, 187, 1.0),
              "Bien");
        });
      } else {
        if (isFeasible) errorMessage = "¡Fuera de la ubicación asignada!";
        showDialogTemplate(
            context,
            "Información de asistencia",
            "$errorMessage\nStatus: ${geoFenceStatus.toString()}",
            "assets/gif/close.gif",
            Color.fromRGBO(200, 71, 108, 1.0),
            "Oops!");
      }
    });
  });
}
