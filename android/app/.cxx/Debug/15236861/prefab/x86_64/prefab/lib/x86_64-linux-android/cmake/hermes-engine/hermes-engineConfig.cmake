if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/alialhadimansour/.gradle/caches/8.10.2/transforms/34ba2549cc2b63eaed64d18d16cf3de8/transformed/jetified-hermes-android-0.76.9-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/alialhadimansour/.gradle/caches/8.10.2/transforms/34ba2549cc2b63eaed64d18d16cf3de8/transformed/jetified-hermes-android-0.76.9-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

