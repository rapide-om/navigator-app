const fs = require('fs');
const path = require('path');

const cmakeFile = path.join(
  __dirname,
  '../android/app/build/generated/autolinking/src/main/jni/Android-autolinking.cmake'
);

const cppFile = path.join(
  __dirname,
  '../android/app/build/generated/autolinking/src/main/jni/autolinking.cpp'
);

if (fs.existsSync(cmakeFile)) {
  let content = fs.readFileSync(cmakeFile, 'utf8');

  // Remove the add_subdirectory line for react-native-config
  content = content.replace(
    /add_subdirectory\(".*?react-native-config\/android\/build\/generated\/source\/codegen\/jni\/" RNCConfigModule_autolinked_build\)\s*\n/g,
    ''
  );

  // Remove the react_codegen_RNCConfigModule from AUTOLINKED_LIBRARIES
  content = content.replace(/\s*react_codegen_RNCConfigModule\s*\n/g, '\n');

  fs.writeFileSync(cmakeFile, content);
  console.log('🧹 Fixed react-native-config JNI autolink in Android-autolinking.cmake');
} else {
  console.log('⏭️  Skipping react-native-config fix - CMake file not generated yet');
}

if (fs.existsSync(cppFile)) {
  let content = fs.readFileSync(cppFile, 'utf8');

  // Remove the include for RNCConfigModule.h
  content = content.replace(/#include <RNCConfigModule\.h>\s*\n/g, '');

  // Remove the module provider code block for RNCConfigModule
  content = content.replace(
    /auto module_RNCConfigModule = RNCConfigModule_ModuleProvider\(moduleName, params\);\s*\nif \(module_RNCConfigModule != nullptr\) \{\s*\nreturn module_RNCConfigModule;\s*\n\}\s*\n/g,
    ''
  );

  fs.writeFileSync(cppFile, content);
  console.log('🧹 Fixed react-native-config include in autolinking.cpp');
} else {
  console.log('⏭️  Skipping react-native-config fix - CPP file not generated yet');
}
