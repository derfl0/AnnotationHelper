<?php

class AnnotationhelperPlugin extends StudIPPlugin implements SystemPlugin
{
    public function __construct()
    {
        parent::__construct();

        $this->addStylesheet('/assets/style.less');
        PageLayout::addScript($this->getPluginURL() . '/assets/textarea-helper.js');
        PageLayout::addScript($this->getPluginURL() . '/assets/application.js');
    }

    public function search_action()
    {
        $needle    = Request::get('needle');
        $vis_query = get_vis_query('aum');

        $query = "SELECT aum.user_id, aum.username,
                         CONCAT(aum.Vorname, ' ', aum.Nachname, ' (', aum.username, ')') AS name
                  FROM auth_user_md5 AS aum
                  LEFT JOIN contact AS c ON aum.user_id = c.user_id AND c.owner_id = :user_id
                  WHERE (aum.username LIKE :search
                         OR CONCAT_WS(' ', aum.Vorname, aum.Nachname) LIKE :search)
                    AND {$vis_query}
                  ORDER BY aum.username = :needle DESC,
                           aum.username LIKE CONCAT(:needle, '%') DESC,
                           c.owner_id IS NOT NULL DESC
                  LIMIT 5";
        $statement = DBManager::get()->prepare($query);
        $statement->bindValue(':search', '%' . $needle . '%');
        $statement->bindValue(':needle', $needle);
        $statement->bindValue(':user_id', $GLOBALS['user']->id);
        $statement->execute();
        $results = $statement->fetchGrouped(PDO::FETCH_ASSOC);
        
        foreach ($results as $user_id => $result) {
            $results[$user_id]['avatar'] = Avatar::getAvatar($user_id)->getURL(Avatar::SMALL);
        }

        header('Content-Type: application/json');
        echo json_encode($results);
    }
}
