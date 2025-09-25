import 'package:firebase_database/firebase_database.dart';

import 'oficina.dart';

class Employee {
  String uID = '';
  String employeeID;
  String firstName;
  String? middleName;
  String? lastName;
  String? officeEmail;
  String? alternateEmail;
  String contactNumber = '';
  DateTime? dateOfBirth;
  DateTime? joiningDate;
  String residentialAddress = '';
  int? retirementAge;
  Office? joiningUnit;
  String designation;

  Employee? reviewPerson;

  Employee({
    required this.employeeID,
    required this.firstName,
    this.middleName,
    this.lastName,
    required this.residentialAddress,
    required this.contactNumber,
    this.officeEmail,
    this.alternateEmail,
    this.dateOfBirth,
    this.joiningDate,
    this.retirementAge,
    this.joiningUnit,
    required this.designation,
    this.reviewPerson,
  });

  Employee.fromSnapshot(DataSnapshot snapshot)
      : uID = (snapshot.value as Map)["UID"],
        employeeID = (snapshot.value as Map)["employeeID"],
        firstName = (snapshot.value as Map)["firstName"],
        middleName = (snapshot.value as Map)["middleName"],
        lastName = (snapshot.value as Map)["lastName"],
        officeEmail = (snapshot.value as Map)["officeEmail"],
        alternateEmail = (snapshot.value as Map)["alternateEmail"],
        dateOfBirth = (snapshot.value as Map)["dateOfBirth"],
        joiningDate = (snapshot.value as Map)["joiningDate"],
        retirementAge = (snapshot.value as Map)["retirementAge"],
        joiningUnit = (snapshot.value as Map)["joiningUnit"],
        designation = (snapshot.value as Map)["designation"],
        reviewPerson = (snapshot.value as Map)["reviewPerson"];

  toJson() {
    return {
      "employeeID": employeeID,
      "firstName": firstName,
      "middleName": middleName,
      "lastName": lastName,
      "officeEmail": officeEmail,
      "alternateEmail": alternateEmail,
      "dateOfBirth": dateOfBirth,
      "joiningDate": joiningDate,
      "retirementAge": retirementAge,
      "joiningUnit": joiningUnit,
      "designation": designation,
      "reviewPerson": reviewPerson,
    };
  }
}
