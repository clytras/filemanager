<?php

return [
    // Path errors
    'err_path_not_dir' => 'Ceļš līdz `:path` nav direktorija.',
    'err_path_not_exist' => 'Ceļš līdz direktorijai `:path` neeksistē.',
    // File errors
    'err_file_upload_invalid_file' => 'Fails nav valīds augšupielādei.',
    'err_file_not_found' => 'Fails netika atrasts.',
    'err_file_path_is_not_set' => 'Faila atrasšanās vieta nav nosakāma.',
    'err_file_cant_rename' => 'Faila pārsaukšana neizdevās.',
    'err_file_ext_cant_be_changed' => 'Faila paplašinājums nevar mainīties.',
    'err_file_info_read' => 'Fails netika atrasts.',
    // Dir errors
    'err_folder_not_found' => 'Direktorija netika atrasta.',
    'err_folder_cant_rename' => 'Direktorijas pārsaukšana neizdevās.',
    'err_folder_this_name_cant_be_used' => 'Direktorijai nedrīkst izmantot tādu vārdu.',
    /**
     * UI translations
     */

    // master
    'title' => 'Crip File Manager',
    'item_title_open_dir' => 'Atvērt direktoriju',
    'actions_new_dir' => 'Jauna direktorija',
    'actions_rename' => 'Pārsaukt',
    'actions_delete' => 'Dzēst',
    'actions_properties' => 'Detaļas',
    'actions_open' => 'Atvērt',
    'breadcrumb_root' => 'Galvenā',
    'breadcrumb_go_to_root' => 'Pāriet uz galveno direktoriju',
    'item_properties_modal_title' => 'Detaļas',
    'item_properties_modal_name' => 'Nosaukums',
    'item_properties_modal_date' => 'Pēdējais modifikācijas datums',
    'item_properties_modal_item_type' => 'Tips',
    'item_properties_modal_file_type_dir' => 'Mape',
    'item_properties_modal_file_type_document' => 'Dokuments',
    'item_properties_modal_file_type_image' => 'Attēls',
    'item_properties_modal_file_type_media' => 'Multivides fails',
    'item_properties_modal_file_type_file' => 'Fails',
    'item_properties_modal_size' => 'Izmērs',
    'item_properties_modal_item_extension' => 'Faila paplašinājums',
    'item_properties_modal_item_url' => 'URL',
    'item_properties_modal_item_dir' => 'Mape',
    'item_properties_modal_size_dim' => '{0}px × {1}px attēls',
    'item_properties_modal_size_url_title' => '{size} sīkfaila URL',
    'item_properties_modal_size_key_thumb' => 'Sīktēla',
    'item_properties_modal_size_key_xs' => 'Ļoti maza izmēra',
    'item_properties_modal_size_key_sm' => 'Maza izmēra',
    'item_properties_modal_size_key_md' => 'Vidēja izmēra',
    'item_properties_modal_size_key_lg' => 'Liela izmēra',
    '' => '',

    /*'context_delete' => 'Dzēst ierakstu',
    'context_disable_rename' => 'Atslēgt pārsaukšanu',
    'context_image_sizes' => 'Izvēlēties izmeru',
    'context_new_folder' => 'Jauna mape',
    'context_open_folder' => 'Atvērt',
    'context_rename' => 'Pārsaukt',
    'context_select' => 'Izvēlēties failu',
    'context_select_size_prefix' => 'Izvēlēties ',
    'delete' => 'Izdzēst',
    'dir_up_text' => '..',
    'err_cant_delete' => 'Nevar izdzēst mapi `:path`',
    'err_cant_delete_file_in' => 'Nevar izdzēst failu`:path`',
    'err_cant_rename_dir_exist' => 'Nevar pārsaukt mapi. Mape at tādu nosaukumu jau eksistē.',
    'err_cant_rename_error' => 'Pārsaukšanas kļūda.',
    'err_cant_rename_file' => 'Pārsaukšanas kļūda.',
    'err_cant_rename_source_file_not_found' => 'Nevar pārsaukt failu. Fails `:name` netika atrasts.',
    'err_cant_rename_source_not_found' => 'Nevar pārsaukt mapi. Mape `:name` netika atrasta.',
    'err_create_dir_exists' => 'Mape jau eksistē.',
    'err_file_does_not_exist_in' => 'Fails neeskistē `:path`',
    'err_incorrect_path' => 'Mapes nosaukums `:path` ir nekorekts un var radīt drošības kļūdas.',
    'err_path_not_dir' => 'Ceļš līdz `:path` nav mape.',
    'err_path_not_exist' => 'Ceļš līdz mapei `:path` neeksistē.',
    'err_uploading_invalid_file' => 'Fails nav valīds augšuplādei.',
    'filter_document' => 'Dokuments',
    'filter_file' => 'Fails',
    'filter_images' => 'Attēls',
    'filter_media' => 'Media',
    'new_folder' => 'Jauna mape',
    'new_folder_placeholder' => 'Ivadīt nosaukumu šeit',
    'open_folder' => 'Atvērt',
    'refresh_folder' => 'Atjaunot',
    'rename' => 'Pārsaukt',
    'rename_save' => 'Saglabāt',
    'save' => 'Saglabāt',
    'select_file' => 'Izvēlēties',
    'size_mb' => 'Mb',
    'success_delete_file' => 'Fails `:file` veiksmīgi izdzēsts.',
    'success_delete_folder' => 'Mape `:path` veiksmīgi izdzēsta.',
    'success_file_renamed_to' => 'Fails `:old` veiksmīgi pārsaukts par `:new`.',
    'success_file_uploaded_to' => 'Fails `:file` veiksmīgi augšuplādēts uz `:path`.',
    'success_folder_created' => 'Mape `:path:name` veiksmīgi izveidota.',
    'success_folder_renamed_to' => 'Mape `:old` veiksmīgi pārsaukta par `:new`.',
    'uploader_cancel' => 'Atcelt',
    'uploader_cancel_all' => 'Atcelt visus',
    'uploader_remove' => 'Izņemt',
    'uploader_remove_all' => 'Attīrīt',
    'uploader_th_actions' => 'Darbības',
    'uploader_th_name' => 'Nosaukums',
    'uploader_th_progress' => 'Progress',
    'uploader_th_size' => 'Izmērs',
    'uploader_th_status' => 'Statuss',
    'uploader_upload' => 'Augšuplādēt',
    'uploader_upload_all' => 'Augšuplādēt visu',
    'warn_empty_folder' => 'Nav atrasts neviens fails. Augšuplādējiet failus vai izveidojiet mapi lai parādītos kontents.',
    'warn_file_rename_not_required' => 'Nosaukums nav mainījies. Faila pārsaukšana atcelta.',
    'warn_rename_not_required' => 'Nosaukums nav mainījies. Mapes pārsaukšana atcelta.',
    'order_by_name_title' => 'Kārtot pēc nosaukuma',
    'order_by_size_title' => 'Kārtot pēc izmēra',
    'order_by_date_title' => 'Kārtot pēc datuma',
    'order_by_name' => 'Nosaukums',
    'order_by_size' => 'Izmērs',
    'order_by_date' => 'Datums',*/
];