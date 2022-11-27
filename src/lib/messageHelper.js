function Decodeuint8arr(uint8array) {
  return new TextDecoder("utf-8").decode(uint8array);
}

export { Decodeuint8arr };
