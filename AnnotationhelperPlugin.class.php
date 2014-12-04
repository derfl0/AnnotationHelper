<?php

class AnnotationhelperPlugin extends StudIPPlugin implements SystemPlugin {

    public function __construct() {
        parent::__construct();

        $navigation = new AutoNavigation(_('AnnotationHelper'));
        $navigation->setURL(PluginEngine::GetURL($this, array(), 'show'));
        $navigation->setImage(Assets::image_path('blank.gif'));
        Navigation::addItem('/annotationhelperplugin', $navigation);

        $this->template_factory = new Flexi_TemplateFactory($this->getPluginPath() . '/templates');
        self::addStylesheet('/assets/style.less');
        PageLayout::addScript($this->getPluginURL() . '/assets/textarea-helper.js');
        PageLayout::addScript($this->getPluginURL() . '/assets/application.js');
    }

    public function initialize() {
        
    }

    public function show_action() {
        if (Request::submitted('search')) {
            $search = "%" . Request::get('search') . "%";
            $stmt = DBManager::get()->prepare("SELECT username,CONCAT_WS(' ',vorname, nachname) as name FROM auth_user_md5 WHERE (username LIKE :search) AND " . get_vis_query() . " LIMIT 5");
            $stmt->bindParam(':search', $search);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            die;
        }

        $template = $this->template_factory->open('show');
        $template->set_attribute('answer', 'Yes');
        $template->set_layout($GLOBALS['template_factory']->open('layouts/base_without_infobox'));
        echo $template->render();
    }

}
