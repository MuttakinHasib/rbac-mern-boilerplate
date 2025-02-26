import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Drawer, Pagination, Form, Row, Col, Input, DatePicker } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateForm from './components/UpdateForm';
import { searchProducts, searchProductsCount, addRule, updateRule, removeRule } from './service';

/**
 * 添加节点
 *
 * @param fields
 */
const handleAdd = async (fields) => {
  const hide = message.loading('正在添加');

  try {
    await addRule({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};
/**
 * 更新节点
 *
 * @param fields
 */

const handleUpdate = async (fields, currentRow) => {
  const hide = message.loading('正在配置');

  try {
    await updateRule({ ...currentRow, ...fields });
    hide();
    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
};
/**
 * 删除节点
 *
 * @param selectedRows
 */

const handleRemove = async (selectedRows) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState(false);
  /** 分布更新窗口的弹窗 */

  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const actionRef = useRef();
  const [currentRow, setCurrentRow] = useState();
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [data, setData] = useState({ data: [] });
  const [current, setCurrent] = useState(1);
  const [param, setParam] = useState({});
  const [sort, setSort] = useState({});
  const [total, setTotal] = useState(0);
  const { RangePicker } = DatePicker;

  const fetchProductData = async () => {
    console.log('current', current, 'param', param);
    const result = await searchProducts({ current: current, pageSize: 10, ...param, ...sort });
    console.log(result);
    setData(result);
  };

  const fetchProductCount = async () => {
    const result = await searchProductsCount({ ...param });
    console.log('fetchProductCount ', result);
    setTotal(result.total);
  };

  useEffect(() => {
    fetchProductData();
    fetchProductCount();
  }, [param]);

  useEffect(() => {
    fetchProductData();
  }, [current, sort]);



  /** 国际化配置 */

  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    setParam(values);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      tip: 'Name of the product',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      valueType: 'textarea',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      sorter: true,
      hideInForm: true,
      renderText: (val) => `${val}`,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      hideInForm: true,
    },
    {
      title: 'Manufacturing date',
      sorter: true,
      dataIndex: 'manufacturingDate',
      valueType: 'dateTime',
    },
    {
      title: 'Actions',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          配置
        </a>,
        <a key="subscribeAlert" href="https://procomponents.ant.design/">
          订阅警报
        </a>,
      ],
    },
  ];
  return (
    <>
      <PageContainer>
        <Form
          form={form}
          name="advanced_search"
          className="ant-advanced-search-form"
          onFinish={onFinish}
          style={{ display: 'flex', 'align-items': 'left', background: 'white', padding: '10px' }}
        >
          <Row gutter={16}>
            <Col flex={6} key={'name'}>
              <Form.Item
                name={`name`}
                label={`Name`}
              >
                <Input placeholder="Search keyword for name" />
              </Form.Item>
            </Col>
            <Col flex={6} key={'size'}>
              <Form.Item
                name={`size`}
                label={`Size`}
              >
                <Input placeholder="Search keyword for size" />
              </Form.Item>
            </Col>
            <Form.Item name="manufacturingDateRange" label="Manuf. date">
              <RangePicker />
            </Form.Item>
            <Col flex={6}>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
              <Button style={{ margin: '0 8px', }} onClick={() => { form.resetFields(); }}>
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
        <ProTable
          headerTitle="Products"
          actionRef={actionRef}
          rowKey="_id"
          // search={{
          //   labelWidth: 'auto',
          // }}
          search={false}
          toolBarRender={() => [
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                // handleModalVisible(true);
                console.log('plus button clicked');
              }}
            >
              <PlusOutlined /> New
            </Button>,
          ]}
          // request={getProducts}
          onChange={(_, _filter, _sorter) => {
            console.log('_sorter', _sorter);
            let sort = {};
            sort['sort'] = _sorter.field;
            sort['order'] = _sorter.order === 'ascend' ? 1 : -1;
            setSort(sort);
          }}
          onSubmit={(params) => { console.log(params); setParam(params); }}
          dataSource={data.data}
          columns={columns}
          rowSelection={false}
          pagination={false}
        />
        {selectedRowsState?.length > 0 && (
          <FooterToolbar
            extra={
              <div>
                已选择{' '}
                <a
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {selectedRowsState.length}
                </a>{' '}
                项 &nbsp;&nbsp;
                <span>
                  XYZ服务调用次数总计 {selectedRowsState.reduce((pre, item) => pre + item.callNo, 0)} 万
                </span>
              </div>
            }
          >
            <Button
              onClick={async () => {
                await handleRemove(selectedRowsState);
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
              }}
            >
              批量删除
            </Button>
            <Button type="primary">批量审批</Button>
          </FooterToolbar>
        )}
        <ModalForm
          title="Modal form 新建规则"
          width="400px"
          visible={createModalVisible}
          onVisibleChange={handleModalVisible}
          onFinish={async (value) => {
            const success = await handleAdd(value);

            if (success) {
              handleModalVisible(false);

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        >
          <ProFormText
            rules={[
              {
                required: true,
                message: '规则名称为必填项',
              },
            ]}
            width="md"
            name="name"
          />
          <ProFormTextArea width="md" name="desc" />
        </ModalForm>
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value, currentRow);

            if (success) {
              handleUpdateModalVisible(false);
              setCurrentRow(undefined);

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
          }}
          updateModalVisible={updateModalVisible}
          values={currentRow || {}}
        />

        <Drawer
          width={600}
          visible={showDetail}
          onClose={() => {
            setCurrentRow(undefined);
            setShowDetail(false);
          }}
          closable={false}
        >
          {currentRow?.name && (
            <ProDescriptions
              column={1}
              title={currentRow?.name}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.name,
              }}
              columns={columns}
            />
          )}
        </Drawer>
      </PageContainer>
      <Pagination
        total={total}
        showSizeChanger={false}
        showQuickJumper={false}
        showTotal={total => `Total ${total} items`}
        onChange={(page, pageSize) => { setCurrent(page); }}
        // style={{ background: 'white', padding: '10px' }}
        style={{ display: 'flex', 'justify-content': 'center', 'align-items': 'center', background: 'white', padding: '10px' }}
      />
    </>
  );
};

export default TableList;
