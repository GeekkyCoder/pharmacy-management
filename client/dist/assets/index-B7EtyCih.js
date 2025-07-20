import{V as le,U as ce,ae as pe,W as xe,b as h,O as e,az as O,a9 as L,aB as w,Z as z,a3 as C,aJ as ge}from"./index-7GMsSKZT.js";import{M as he,T as V}from"./index-BKd6h6hO.js";import{R as fe}from"./DownloadOutlined-CyJxdiP5.js";import"./ActionButton-vApjKJIa.js";import"./context-D8GFme0r.js";const{Title:me}=ce,{Search:ye}=pe,ue=y=>{var $,k,R,D,N,K,W,Y,Q,B,E;const[q,H]=h.useState([]),[S,U]=h.useState({current:1,pageSize:10,total:0}),[G,F]=h.useState(!1),[T,J]=h.useState(""),[Z,P]=h.useState(!1),[r,_]=h.useState(null),[a,X]=h.useState(null),[ee,M]=h.useState(!1),A=async(t=1,i=10,n="")=>{var d,l;F(!0);try{const x=await C.get("/invoice/getAllInvoices",{params:{page:t,limit:i,search:n}}),{data:c,total:f,page:u,limit:v}=x.data;H(c==null?void 0:c.invoices),U({current:u,pageSize:v,total:f})}catch(x){y.error(((l=(d=x==null?void 0:x.response)==null?void 0:d.data)==null?void 0:l.message)||"Failed to fetch invoices")}finally{F(!1)}},te=async()=>{var t,i;try{const n=await C.get("/pharmacy-info");n.data.success&&X(n.data.data)}catch(n){y.error(((i=(t=n==null?void 0:n.response)==null?void 0:t.data)==null?void 0:i.message)||"Failed to fetch pharmacy information")}};h.useEffect(()=>{A(S.current,S.pageSize,T),te()},[]);const ie=t=>{A(t.current,t.pageSize,T)},ne=t=>{J(t),A(1,S.pageSize,t)};console.log("Pharmacy Info:",a);const se=t=>{var n,d,l,x,c,f,u,v,b,I,s,p;if(!a){y.error("Pharmacy information is not available");return}const i=a;return`
      <html>
        <head>
          <title>Invoice - ${t.invoiceId}</title>
          <style>
            @page { margin: 0; size: 80mm 297mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.4;
              color: #000;
              background: white;
              width: 80mm;
              margin: 0 auto;
              padding: 8px;
            }
            .receipt-container { width: 100%; max-width: 76mm; margin: 0 auto; }
            .header {
              text-align: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 2px solid #000;
            }
            .logo {
              max-width: 60px;
              height: auto;
              margin: 0 auto 8px;
              display: block;
              border-radius: 50%;
            }
            .pharmacy-name {
              font-size: 16px;
              font-weight: bold;
              margin: 4px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .pharmacy-tagline {
              font-size: 10px;
              font-style: italic;
              margin: 2px 0;
              color: #555;
            }
            .pharmacy-details {
              font-size: 9px;
              margin: 2px 0;
              line-height: 1.2;
            }
            .license-info {
              font-size: 8px;
              margin-top: 4px;
              color: #666;
            }
            .invoice-header {
              text-align: center;
              margin: 10px 0;
              padding: 6px 0;
              background: #f0f0f0;
              border: 1px solid #ccc;
            }
            .invoice-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .customer-info {
              margin: 10px 0;
              padding: 6px;
              background: #f9f9f9;
              border: 1px dashed #999;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
              font-size: 10px;
            }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .solid-divider { border-top: 2px solid #000; margin: 8px 0; }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0;
            }
            .items-table th {
              background: #e0e0e0;
              padding: 4px 2px;
              font-size: 9px;
              font-weight: bold;
              text-align: left;
              border-bottom: 1px solid #999;
            }
            .items-table td {
              padding: 3px 2px;
              font-size: 9px;
              border-bottom: 1px dotted #ccc;
              vertical-align: top;
            }
            .item-name {
              font-weight: bold;
              max-width: 30mm;
              word-wrap: break-word;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .discount-info {
              background: #e8f5e8;
              padding: 4px;
              margin: 4px 0;
              border: 1px dashed #4CAF50;
              font-size: 9px;
            }
            .totals-section {
              margin: 10px 0;
              padding: 8px;
              background: #f5f5f5;
              border: 1px solid #ddd;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 10px;
            }
            .final-total {
              font-size: 14px;
              font-weight: bold;
              padding: 4px 0;
              border-top: 2px solid #000;
              margin-top: 4px;
            }
            .savings-highlight {
              color: #4CAF50;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 12px;
              padding-top: 8px;
              border-top: 2px solid #000;
              font-size: 8px;
              line-height: 1.3;
            }
            .thank-you {
              font-size: 10px;
              font-weight: bold;
              margin: 4px 0;
            }
            .return-policy {
              font-size: 7px;
              color: #666;
              margin: 2px 0;
            }
            .qr-placeholder {
              width: 30px;
              height: 30px;
              background: #ddd;
              margin: 8px auto;
              border: 1px solid #999;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 6px;
            }
            @media print {
              body { margin: 0; padding: 8px; }
              .receipt-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="pharmacy-name">${i.pharmacyName}</div>
              <div class="pharmacy-details">
                ${(n=i.address)==null?void 0:n.street}<br>
                ${(d=i.address)==null?void 0:d.city}, ${(l=i.address)==null?void 0:l.state}<br>
                Tel: ${(x=i.contactInfo)==null?void 0:x.phone}<br>
                Email: ${(c=i.contactInfo)==null?void 0:c.email}
              </div>
            </div>

            <div class="invoice-header">
              <div class="invoice-title">SALES INVOICE</div>
              <div>Invoice #: ${t.invoiceId}</div>
            </div>

            <div class="customer-info">
              <div class="info-row">
                <span><strong>Customer:</strong></span>
                <span>${t.C_Name}</span>
              </div>
              <div class="info-row">
                <span><strong>Customer ID:</strong></span>
                <span>${t.C_ID}</span>
              </div>
              <div class="info-row">
                <span><strong>Date:</strong></span>
                <span>${w(t.createdAt).format("DD MMM YYYY")}</span>
              </div>
              <div class="info-row">
                <span><strong>Time:</strong></span>
                <span>${w(t.createdAt).format("hh:mm A")}</span>
              </div>
              <div class="info-row">
                <span><strong>Served by:</strong></span>
                <span>${((f=t.employee)==null?void 0:f.userName)||"Staff"}</span>
              </div>
            </div>

            <div class="divider"></div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 40%;">Item</th>
                  <th style="width: 15%;" class="text-center">Qty</th>
                  <th style="width: 20%;" class="text-right">Price</th>
                  <th style="width: 25%;" class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${(u=t.items)==null?void 0:u.map(o=>{var m,j;const g=o.finalPrice&&o.finalPrice<o.Med_Price*o.Med_Qty;return`
                    <tr>
                      <td class="item-name">${o.Med_Name}</td>
                      <td class="text-center">${o.Med_Qty}</td>
                      <td class="text-right">PKR ${(m=o.Med_Price)==null?void 0:m.toFixed(2)}</td>
                      <td class="text-right">
                        ${g?`<div style="text-decoration: line-through; color: #999; font-size: 8px;">PKR ${(o.Med_Price*o.Med_Qty).toFixed(2)}</div>
                           <div style="color: #4CAF50; font-weight: bold;">PKR ${(j=o.finalPrice)==null?void 0:j.toFixed(2)}</div>`:`PKR ${(o.Med_Price*o.Med_Qty).toFixed(2)}`}
                      </td>
                    </tr>
                    ${g&&o.discount?`<tr>
                         <td colspan="4" style="font-size: 8px; color: #4CAF50; font-style: italic;">
                           ↳ ${o.discount.name} (-PKR ${(o.Med_Price*o.Med_Qty-o.finalPrice).toFixed(2)})
                         </td>
                       </tr>`:""}
                  `}).join("")}
              </tbody>
            </table>

            <div class="divider"></div>

            ${t.totalSavings&&t.totalSavings>0?`
              <div class="discount-info">
                <div style="font-weight: bold; margin-bottom: 2px;">💰 Savings Applied!</div>
                <div>You saved PKR ${(v=t.totalSavings)==null?void 0:v.toFixed(2)} on this purchase</div>
              </div>
            `:""}

            <div class="totals-section">
              <div class="total-row">
                <span>Total Items:</span>
                <span><strong>${t.No_Of_Items}</strong></span>
              </div>
              ${t.totalSavings&&t.totalSavings>0?`
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>PKR ${(b=t.originalPrice)==null?void 0:b.toFixed(2)}</span>
                </div>
                <div class="total-row savings-highlight">
                  <span>Total Savings:</span>
                  <span>-PKR ${(I=t.totalSavings)==null?void 0:I.toFixed(2)}</span>
                </div>
              `:""}
              <div class="total-row final-total">
                <span>TOTAL AMOUNT:</span>
                <span>PKR ${(s=t.totalPrice)==null?void 0:s.toFixed(2)}</span>
              </div>
            </div>

            <div class="solid-divider"></div>

            <div class="footer">
              <div class="thank-you">Thank You for Your Purchase!</div>

              <div>Your health is our priority</div>
                
              <div class="return-policy">
                • Medicine returns accepted within 7 days with receipt<br>
                • Keep this receipt for warranty claims<br>
                • For queries: ${(p=i.contactInfo)==null?void 0:p.phone}
              </div>
              
              <div style="margin-top: 8px; font-weight: bold;">
                Generated by ${i.pharmacyName} 
              </div>
              
              <div style="margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px;">
                *** End of Receipt ***
              </div>
            </div>
          </div>
        </body>
      </html>
    `},oe=async t=>{var i,n;console.log("invoice",t),y.setLoading(!0);try{const d=new Set((i=t.items)==null?void 0:i.map(s=>{var p,o;return(o=(p=s.med)==null?void 0:p._id)==null?void 0:o.toString()}).filter(s=>s)),l=Array.from(d).map(s=>{const p=t.items.find(g=>{var m,j;return((j=(m=g.med)==null?void 0:m._id)==null?void 0:j.toString())===s}),o=p?p.Med_Qty:1;return C.post("/discount/apply-to-medicine",{medicineId:s,quantity:o}).then(g=>({medicineId:s,...g.data})).catch(g=>(console.error(`Error fetching discount for medicine ${s}:`,g),{medicineId:s,success:!1}))}),x=await Promise.all(l),c={};x.forEach(s=>{s.success&&s.data&&(c[s.medicineId]=s.data)});const f=(n=t.items)==null?void 0:n.map(s=>{var g,m;const p=(m=(g=s.med)==null?void 0:g._id)==null?void 0:m.toString(),o=c[p];return o?{...s,originalAmount:o.originalAmount,finalAmount:o.finalAmount}:{...s,originalAmount:s.Med_Price*s.Med_Qty,finalAmount:s.Med_Price*s.Med_Qty}}),u=f.reduce((s,p)=>s+(p.originalAmount||0),0),v=f.reduce((s,p)=>s+(p.finalAmount||0),0),b=u-v,I={...t,items:f,originalPrice:u,totalPrice:v,totalSavings:b>0?b:0};_(I),P(!0)}catch(d){console.error("Error processing invoice discounts:",d),y.error("Failed to process discounts for invoice"),_(t),P(!0)}finally{y.setLoading(!1)}},ae=t=>{M(!0);const i=window.open("","","height=600,width=400");try{i.document.open(),i.document.write(se(t)),i.document.close(),i.onload=()=>{i.focus(),i.print(),i.onafterprint=()=>{i.close()}}}catch(n){console.error("Error generating PDF:",n),y.error("Failed to generate PDF"),M(!1)}finally{M(!1)}},de=[{title:"Invoice ID",dataIndex:"invoiceId",key:"invoiceId"},{title:"Customer Name",dataIndex:"C_Name",key:"C_Name"},{title:"Customer ID",dataIndex:"C_ID",key:"C_ID"},{title:"Total Amount",dataIndex:"totalPrice",key:"totalPrice",render:(t,i)=>{var d;let n=0;return i.items.forEach(l=>{n+=l.Med_Qty*l.Med_Price}),e.jsxs("div",{children:[e.jsxs("strong",{children:["PKR ",n==null?void 0:n.toFixed(2)]}),i.totalSavings>0&&e.jsx("div",{children:e.jsxs(V,{color:"green",size:"small",children:["Saved PKR ",(d=i.totalSavings)==null?void 0:d.toFixed(2)]})})]})}},{title:"No. of Items",dataIndex:"No_Of_Items",key:"No_Of_Items"},{title:"Sale Performed By",dataIndex:"employee",key:"employee",render:t=>t?`${t.userName} (${t==null?void 0:t.role})`:"N/A"},{title:"Invoice Date",dataIndex:"createdAt",key:"createdAt",render:(t,i)=>w(i.createdAt).format("DD MMM YYYY, hh:mm A")},{title:"Actions",key:"actions",width:120,render:(t,i)=>e.jsx(O,{children:e.jsx(z,{type:"primary",icon:e.jsx(ge,{}),size:"small",onClick:()=>oe(i),title:"View Invoice"})})}],re=t=>{const i=[{title:"Medicine Name",dataIndex:"Med_Name",key:"Med_Name"},{title:"Quantity",dataIndex:"Med_Qty",key:"Med_Qty"},{title:"Unit Price",dataIndex:"Med_Price",key:"Med_Price",render:n=>`PKR ${n==null?void 0:n.toFixed(2)}`},{title:"Total",key:"total",render:(n,d)=>{const l=d.Med_Price*d.Med_Qty,x=d.finalPrice||l,c=x<l;return e.jsxs("div",{children:[c&&e.jsxs("div",{style:{textDecoration:"line-through",color:"#999",fontSize:"12px"},children:["PKR ",l.toFixed(2)]}),e.jsxs("div",{style:{color:c?"#4CAF50":"inherit",fontWeight:c?"bold":"normal"},children:["PKR ",x.toFixed(2)]}),c&&d.discount&&e.jsx(V,{color:"green",size:"small",children:d.discount.name})]})}}];return e.jsx(L,{columns:i,dataSource:t.items,rowKey:(n,d)=>d,pagination:!1,size:"small"})};return e.jsxs("div",{style:{padding:"24px"},children:[e.jsx(me,{level:3,children:"Invoices"}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",alignItems:"center"},children:e.jsx(O,{style:{marginBottom:16},children:e.jsx(ye,{placeholder:"Search by customer name or invoice ID",allowClear:!0,enterButton:!0,onSearch:ne})})}),e.jsx(L,{columns:de,dataSource:q,rowKey:"_id",expandable:{expandedRowRender:re},pagination:S,loading:G,onChange:ie,scroll:{x:1e3}}),e.jsx(he,{title:`Invoice Details - ${r==null?void 0:r.invoiceId}`,open:Z,onCancel:()=>{P(!1),_(null)},footer:[e.jsx(z,{type:"primary",icon:e.jsx(fe,{}),loading:ee,onClick:()=>ae(r),children:"Download PDF"},"download"),e.jsx(z,{onClick:()=>{P(!1),_(null)},children:"Close"},"close")],width:800,bodyStyle:{maxHeight:"70vh",overflowY:"auto"},children:r&&a&&e.jsxs("div",{style:{width:"80mm",padding:12,display:"block",margin:"0 auto",border:"1px solid #ddd",borderRadius:"8px",backgroundColor:"#fff",fontFamily:"'Courier New', monospace",fontSize:"11px",lineHeight:"1.4",transform:"scale(1.2)",transformOrigin:"top center"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:12,paddingBottom:8,borderBottom:"2px solid #000"},children:[e.jsx("h3",{style:{margin:"4px 0",fontSize:"16px",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"1px"},children:a==null?void 0:a.pharmacyName}),e.jsxs("div",{style:{fontSize:9,margin:"4px 0"},children:[($=a==null?void 0:a.address)==null?void 0:$.street,e.jsx("br",{}),(k=a==null?void 0:a.address)==null?void 0:k.city,", ",(R=a==null?void 0:a.address)==null?void 0:R.state,e.jsx("br",{}),"Tel: ",(D=a==null?void 0:a.contactInfo)==null?void 0:D.phone]})]}),e.jsxs("div",{style:{textAlign:"center",margin:"10px 0",padding:"6px 0",background:"#f0f0f0",border:"1px solid #ccc"},children:[e.jsx("div",{style:{fontSize:14,fontWeight:"bold",marginBottom:4},children:"SALES INVOICE"}),e.jsxs("div",{children:["Invoice #: ",r.invoiceId]})]}),e.jsxs("div",{style:{margin:"10px 0",padding:6,background:"#f9f9f9",border:"1px dashed #999"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"2px 0",fontSize:10},children:[e.jsx("span",{children:e.jsx("strong",{children:"Customer:"})}),e.jsx("span",{children:r.C_Name})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"2px 0",fontSize:10},children:[e.jsx("span",{children:e.jsx("strong",{children:"Customer ID:"})}),e.jsx("span",{children:r.C_ID})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"2px 0",fontSize:10},children:[e.jsx("span",{children:e.jsx("strong",{children:"Date:"})}),e.jsx("span",{children:w(r.createdAt).format("DD MMM YYYY")})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"2px 0",fontSize:10},children:[e.jsx("span",{children:e.jsx("strong",{children:"Time:"})}),e.jsx("span",{children:w(r.createdAt).format("hh:mm A")})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"2px 0",fontSize:10},children:[e.jsx("span",{children:e.jsx("strong",{children:"Served by:"})}),e.jsx("span",{children:((N=r.employee)==null?void 0:N.userName)||"Staff"})]})]}),e.jsx("div",{style:{borderTop:"1px dashed #000",margin:"8px 0"}}),e.jsxs("table",{style:{width:"100%",fontSize:9,borderCollapse:"collapse",margin:"8px 0"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"#e0e0e0"},children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 2px",fontWeight:"bold",borderBottom:"1px solid #999"},children:"Item"}),e.jsx("th",{style:{textAlign:"center",padding:"4px 2px",fontWeight:"bold",borderBottom:"1px solid #999"},children:"Qty"}),e.jsx("th",{style:{textAlign:"right",padding:"4px 2px",fontWeight:"bold",borderBottom:"1px solid #999"},children:"Price"}),e.jsx("th",{style:{textAlign:"right",padding:"4px 2px",fontWeight:"bold",borderBottom:"1px solid #999"},children:"Total"})]})}),e.jsx("tbody",{children:(K=r.items)==null?void 0:K.map((t,i)=>{var l;console.log("ittttt",t);const n=t.finalAmount&&t.finalAmount<t.Med_Price*t.Med_Qty,d=t.finalAmount||t.Med_Price*t.Med_Qty;return e.jsxs("tr",{style:{borderBottom:"1px dotted #ccc"},children:[e.jsx("td",{style:{padding:"3px 2px",fontWeight:"bold",maxWidth:"30mm",wordWrap:"break-word"},children:t.Med_Name}),e.jsx("td",{style:{padding:"3px 2px",textAlign:"center"},children:t.Med_Qty}),e.jsxs("td",{style:{padding:"3px 2px",textAlign:"right"},children:["PKR ",(l=t.Med_Price)==null?void 0:l.toFixed(2)]}),e.jsx("td",{style:{padding:"3px 2px",textAlign:"right"},children:n?e.jsxs("div",{children:[e.jsxs("div",{style:{textDecoration:"line-through",color:"#999",fontSize:"8px"},children:["PKR ",(t.Med_Price*t.Med_Qty).toFixed(2)]}),e.jsxs("div",{style:{color:"#4CAF50",fontWeight:"bold"},children:["PKR ",d.toFixed(2)]})]}):`PKR ${d.toFixed(2)}`})]},i)})})]}),e.jsx("div",{style:{borderTop:"1px dashed #000",margin:"8px 0"}}),r.totalSavings&&r.totalSavings>0&&e.jsxs("div",{style:{background:"#e8f5e8",padding:4,margin:"4px 0",border:"1px dashed #4CAF50",fontSize:9},children:[e.jsx("div",{style:{fontWeight:"bold",marginBottom:2},children:"💰 Savings Applied!"}),e.jsxs("div",{children:["Customer saved PKR"," ",(W=r.totalSavings)==null?void 0:W.toFixed(2)," on this purchase"]})]}),e.jsxs("div",{style:{margin:"10px 0",padding:8,background:"#f5f5f5",border:"1px solid #ddd"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"3px 0",fontSize:10},children:[e.jsx("span",{children:"Total Items:"}),e.jsx("span",{children:e.jsx("strong",{children:r.No_Of_Items})})]}),r.totalSavings&&r.totalSavings>0&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"3px 0",fontSize:10},children:[e.jsx("span",{children:"Subtotal:"}),e.jsxs("span",{children:["PKR ",(Y=r.originalPrice)==null?void 0:Y.toFixed(2)]})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",margin:"3px 0",fontSize:10,color:"#4CAF50",fontWeight:"bold"},children:[e.jsx("span",{children:"Total Savings:"}),e.jsxs("span",{children:["-PKR ",(Q=r.totalSavings)==null?void 0:Q.toFixed(2)]})]})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:"bold",padding:"4px 0",borderTop:"2px solid #000",marginTop:4},children:[e.jsx("span",{children:"TOTAL AMOUNT:"}),e.jsxs("span",{children:["PKR ",(B=r.totalPrice)==null?void 0:B.toFixed(2)]})]})]}),e.jsx("div",{style:{borderTop:"2px solid #000",margin:"8px 0"}}),e.jsxs("div",{style:{textAlign:"center",marginTop:12,paddingTop:8,borderTop:"2px solid #000",fontSize:8,lineHeight:"1.3"},children:[e.jsx("div",{style:{fontSize:10,fontWeight:"bold",margin:"4px 0"},children:"Thank You for Your Purchase!"}),e.jsx("div",{children:"Your health is our priority"}),e.jsxs("div",{style:{fontSize:7,color:"#666",margin:"2px 0"},children:["• Medicine returns accepted within 7 days with receipt",e.jsx("br",{}),"• Keep this receipt for warranty claims",e.jsx("br",{}),"• For queries: ",(E=a==null?void 0:a.contactInfo)==null?void 0:E.phone]}),e.jsxs("div",{style:{marginTop:8,fontWeight:"bold"},children:["Generated by ",a==null?void 0:a.pharmacyName]}),e.jsx("div",{style:{marginTop:4,borderTop:"1px dashed #000",paddingTop:4},children:"*** End of Receipt ***"})]})]})})]})},Pe=le(xe(ue));export{Pe as default};
