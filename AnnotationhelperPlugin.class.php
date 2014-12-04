<?php

class AnnotationhelperPlugin extends StudIPPlugin implements SystemPlugin {

    public function __construct() {
        parent::__construct();
        self::addStylesheet('/assets/style.less');
        PageLayout::addScript($this->getPluginURL() . '/assets/textarea-helper.js');
        PageLayout::addScript($this->getPluginURL() . '/assets/application.js');
    }

    public function initialize() {
        
    }

    public function show_action() {
        if (Request::submitted('search')) {
            $search = "%" . Request::get('search') . "%";
            $stmt = DBManager::get()->prepare("SELECT username,CONCAT_WS(' ',vorname, nachname) as name FROM auth_user_md5 WHERE (username LIKE :search OR nachname LIKE :search OR vorname LIKE :search ) AND " . get_vis_query() . " LIMIT 5");
            $stmt->bindParam(':search', $search);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            die;
        }
    }

}
