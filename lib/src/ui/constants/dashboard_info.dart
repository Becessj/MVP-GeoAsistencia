import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../pages/registrador_asistencia.dart';
import '../pages/resumen_asistencia.dart';


void attendanceSummaryCallback(BuildContext context, User user) {
  Navigator.push(
    context,
    CupertinoPageRoute(
        builder: (context) => AttendanceSummary(
              title: "Attendance Summary",
              user: user,
            )),
  );
}

void attendanceRecorderCallback(BuildContext context, User user) {
  Navigator.push(
      context,
      CupertinoPageRoute(
          builder: (context) => AttendanceRecorderWidget(user: user)));
}


List<List> infoAboutTiles = [
  [
    "assets/icons/attendance_recorder.png",
    "Marcar asistencia",
    "Entrada y salida",
    attendanceRecorderCallback
  ],
  [
    "assets/icons/attendance_summary.png",
    "Resumen de asistencia",
    "Registro previo",
    attendanceSummaryCallback
  ],
[
  "assets/icons/leave_status.png",
  "Acerca de",
  "Versión 1.0.0",
  (context, user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Image.asset("assets/icons/leave_status.png", width: 28, height: 28),
            SizedBox(width: 8),
            Text("Geo Asistencia"),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("Versión 1.0.0"),
            SizedBox(height: 8),
            Text(
              "Aplicación de control de asistencia por geolocalización.",
              textAlign: TextAlign.left,
            ),
            SizedBox(height: 12),
            Text(
              "Contacto: informatica@guamanpoma.org",
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text("Cerrar"),
          ),
        ],
      ),
    );
  }
],


];
