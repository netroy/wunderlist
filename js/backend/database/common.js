var ENGINES = {
  IXDB: 0,  // IndexedDB - For Firefox & all upcoming browsers.
  WSQL: 1,  // WebSQL - For existing WebKit (desktop & mobile) & Opera.
  AJAX: 2,  // AJAX (over the wire) - for ancient browsers.
  TAPP: 3   // Titanium Appecelarator - Native apps for Devices.
};