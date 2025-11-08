if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/alialhadimansour/.gradle/caches/8.10.2/transforms/c37cc21f9a15e3e51b73731a828a1fd6/transformed/jetified-hermes-android-0.77.0-rc.6-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/alialhadimansour/.gradle/caches/8.10.2/transforms/c37cc21f9a15e3e51b73731a828a1fd6/transformed/jetified-hermes-android-0.77.0-rc.6-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

