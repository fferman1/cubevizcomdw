<?php
/**
 * This class represents a DataSet
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_VocabularyTerms_DataSet extends ArrayObject
{    
	/**
	 * @param $label Data Set label
	 * @param $uri Data Set uri
	*/
	public function __construct($url = '', $label = '') {
		$this ['url'] = $url;
		$this ['label'] = $label;
	}
}
