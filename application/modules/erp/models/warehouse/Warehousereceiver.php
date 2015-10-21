<?php
/**
 * 2013-7-6 下午10:32:26
 * @author x.li
 * @abstract 
 */
class Erp_Model_Warehouse_Warehousereceiver extends Application_Model_Db
{
    /**
     * 表名、主键
     */
    protected $_name = 'erp_warehouse_receiver';
    protected $_primary = 'id';
    
    // 获取收货人清单
    public function getList()
    {
        $sql = $this->select()
                    ->setIntegrityCheck(false)
                    ->from(array('t1' => $this->_name), array('id'))
                    ->joinLeft(array('t2' => $this->_dbprefix.'user'), "t2.id = t1.user_id", array())
                    ->joinLeft(array('t3' => $this->_dbprefix.'employee'), "t3.id = t2.employee_id", array('name' => 'cname'));
        $data = $this->fetchAll($sql)->toArray();
        
        array_push($data, array('id' => 0, 'name' => '客户'));
        
        return $data;
    }

    // 获取收货人列表
    public function getData($id = null)
    {
        $sql = $this->select()
                    ->setIntegrityCheck(false)
                    ->from(array('t1' => $this->_name))
                    ->joinLeft(array('t2' => $this->_dbprefix.'user'), "t2.id = t1.create_user", array())
                    ->joinLeft(array('t3' => $this->_dbprefix.'employee'), "t3.id = t2.employee_id", array('creater' => 'cname'))
                    ->joinLeft(array('t4' => $this->_dbprefix.'user'), "t4.id = t1.update_user", array())
                    ->joinLeft(array('t5' => $this->_dbprefix.'employee'), "t5.id = t4.employee_id", array('updater' => 'cname'))
                    ->joinLeft(array('t6' => $this->_dbprefix.'user'), "t1.user_id = t6.id", array())
                    ->joinLeft(array('t7' => $this->_dbprefix.'employee'), "t6.employee_id = t7.id", array('cname', 'ename'));
        if($id){
            $sql->where("t1.id = ".$id);
            $data = $this->fetchRow($sql)->toArray();
            return $data;
        }
        
        $data = $this->fetchAll($sql)->toArray();

        for($i = 0; $i < count($data); $i++){
            $data[$i]['create_time'] = strtotime($data[$i]['create_time']);
            $data[$i]['update_time'] = strtotime($data[$i]['update_time']);
            
            $data[$i]['active'] = $data[$i]['active'] == 1 ? true : false;
        }

        return $data;
    }
}