import 'dart:async';
import 'package:flutter/material.dart';
import 'package:easy_geofencing/easy_geofencing.dart';
import 'package:easy_geofencing/enums/geofence_status.dart';
import 'package:asistencia-gpa/src/models/oficina.dart';

class GeoFencing extends InheritedWidget {
  GeoFencing({
    super.key,
    required super.child,
    required this.service,
  });

  final GeoFencingService service;

  @override
  bool updateShouldNotify(InheritedWidget old) => true;

  static GeoFencing of(BuildContext context) {
    final GeoFencing? result =
        context.dependOnInheritedWidgetOfExactType<GeoFencing>();
    assert(result != null, 'No GeoFencingService found in context');
    return result!;
  }
}

class GeoFencingService with ChangeNotifier {
  GeofenceStatus geofenceStatus = GeofenceStatus.init;

  StreamSubscription<GeofenceStatus>? _sub;
  bool _running = false;
  Office? _currentOffice;

  /// Inicia el geofencing para la oficina indicada.
  /// Cancela cualquier suscripción previa ANTES de suscribirse de nuevo.
  Future<void> startGeofencing(Office office) async {
    // Si ya está corriendo para la misma oficina, no hagas nada.
    if (_running &&
        _currentOffice != null &&
        _currentOffice!.latitude == office.latitude &&
        _currentOffice!.longitude == office.longitude &&
        _currentOffice!.radius == office.radius) {
      return;
    }

    // Limpia lo anterior (evita "Stream already listened")
    await _sub?.cancel();
    _sub = null;
    _running = false;

    // Reinicia servicio nativo
    EasyGeofencing.stopGeofenceService();

    // Arranca servicio
    await EasyGeofencing.startGeofenceService(
      pointedLatitude: office.latitude.toString(),
      pointedLongitude: office.longitude.toString(),
      radiusMeter: office.radius.toString(),
      eventPeriodInSeconds: 5,
    );

    _currentOffice = office;

    // IMPORTANTE: suscríbete solo UNA vez. Si este stream es single-subscription,
    // esto evita el crash. Si necesitas múltiples listeners en otras capas,
    // conviértelo a broadcast aquí:
    // final stream = EasyGeofencing.getGeofenceStream()!.asBroadcastStream();
    final stream = EasyGeofencing.getGeofenceStream()!;

    _sub = stream.listen((GeofenceStatus status) {
      geofenceStatus = status;
      notifyListeners();
    });

    _running = true;
  }

  /// Detiene y limpia recursos
  Future<void> stopGeofencing() async {
    await _sub?.cancel();
    _sub = null;
    _running = false;
    _currentOffice = null;
    EasyGeofencing.stopGeofenceService();
    geofenceStatus = GeofenceStatus.init;
    notifyListeners();
  }

  bool get isRunning => _running;
}
