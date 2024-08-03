import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
const emailData = {
  emailAddress: 'user@example.com',
  messages: [
    {
      messageId: '190f239a0b0ccd52',
      subject: 'Fwd: Inaugural newsletter for EEE alumni, Singapore Polytechnic',
      historyId: '29512',
      date: 'Sat, 27 Jul 2024 11:25:44 +0800',
      qrCodeByContentId: [
        {
          cid: 'ii_190f2388c4123a1f8ce',
          attachmentId: 'ANGjdJ_o4rREokfsZGp6r4aq9eZwPDCmatH7kcFkHsmKftrFGXBkPCvvdAgr8_oyYMcovpwJP8rzNvImcql0BAYOPCzdCBIeKoX7qddlA51CdsRfkRD7J56JMWbxiwb6qgZkDSDVp3zgEmiPhbk52Cm_QtlSZ8fsmMqAR_jDW9LbdxSSPY-mQJc3pMSgwHG69_BzBvBKXvW3-sJHHt1uL8J1cVo3yrTQ5X_SG3xkyv7eYKu9iFZ65mz70sW2PIooDmZroBRMfXgXnfK0vhp0kFb3vDcKDl8unN9YjRIrRdCov_7thsCIn_ahhFMCd4gPoLMnsva3czuVNbQz7Ze-Uihk3RLc6FuoVzV8BxmEjuYMApxPDm17ztm6FG9i_TADSQFE5e4ZxtJycCA3lYr0',
          decodedContent: [
            'https://icrm.sp.edu.sg/alumni/',
            'https://industry.sp.edu.sg/span/career-opportunities/'
          ],
          totalQRCodeFound: 2
        }
      ]
    },
    {
      messageId: '190f2386f85c3a36',
      subject: 'Fwd: Counting Down - ITE Alumni Association 25th Anniversary Beach Cleanup',
      historyId: '29518',
      date: 'Sat, 27 Jul 2024 11:24:26 +0800',
      qrCodeByURL: [
        {
          url: 'https://www.itealumni.org.sg/massemail/20221021/beach_clean_up_qrcode.png',
          decodedContent: [
            'https://me-qr.com/YHuVUWd'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190f233d7ca4d8ac',
      subject: 'Fwd: You’ve unlocked the Business Profile Rewards Programme!',
      historyId: '29571',
      date: 'Sat, 27 Jul 2024 11:19:25 +0800',
      qrCodeByURL: [
        {
          url: 'https://image.mkt.grab.com/lib/fe3a15707564067f751c78/m/55/8a4a3d09-136f-45df-b093-cc7ba5ae5a58.png',
          decodedContent: [
            'https://grab.onelink.me/2695613898?pid=EDM&c=ALL_NA_PAX_GFB_ALL_REG__BusinessRidesChallenge_NA&is_retargeting=true&af_dp=grab%3A%2F%2Fopen%3FscreenType%3DREWARDSWEB%26screen%3Dchallenge&af_force_deeplink=true&af_sub5=edm&af_ad=&af_web_dp=https%3A%2F%2Fwww.grab.com%2Fdownload%2F'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190f232a1a55c1dd',
      subject: 'Fwd: [UPDATE!] EEE Alumni Homecoming 2024 is now on 2 Aug, Friday',
      historyId: '29574',
      date: 'Sat, 27 Jul 2024 11:18:05 +0800',
      qrCodeByURL: [
        {
          url: 'https://file-au.clickdimensions.com/spedusg-a7v6v/files/eeealumnihomecoming2024on2aug.jpg',
          decodedContent: [
            'https://scanned.page/6645b492afa32'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190f231cb59cb122',
      subject: 'Fwd: Latest Job Opportunities (posted in Aug) with Attractive Salaries for ITE Graduates - follow us on IG, FB & TG!',
      historyId: '29580',
      date: 'Sat, 27 Jul 2024 11:17:11 +0800',
      qrCodeByContentId: [
        {
          cid: 'ii_190f2310981c2203e801',
          attachmentId: 'ANGjdJ9da1OrxMtqkRbiPAvHbJIYMIBzHAbZlVSaSsJKbg3Q3HSSlO1xA5xb1Q8PAbzqh7QjIJ4gIdqo9vTiuQanpkcv7Suhj4KhPFbL2woGSy6w4G_Ihbqw-A2V06oPPO74AZWlDISzDH9bxbs2fjCcaGqFJykXNfYVy4Tfy7ZKbHIC1w12YAcK_xooDPEl48UU5Z0XHhlpWGTnAfMOUvGBkUF28MHFyPwhMYcaQgJ8GajQtm5LsXkiavj4JBU-27oPB9eupTMLzKZXKZY7kzaxLwfI_adCu7HxPQudQoPaVHL_sUHxohm8Tl3mJV0T4sVyzL4bemLEQBVXQfsp55mZspyk6ujOkKe7YHboI_EyNsvcRHKlezO6_uovYI-alBuLSJ2gEIXjViU_63tn',
          decodedContent: [
            'https://sites.google.com/view/itecareerservices/home',
            'https://www.instagram.com/itealumni/',
            'https://www.facebook.com/ITE-Alumni-Network-152816488099453'
          ],
          totalQRCodeFound: 3
        }
      ]
    },
    {
      messageId: '190f2315e39caf67',
      subject: 'Fwd: Invite to SEIT Security Summit 2021',
      historyId: '29596',
      date: 'Sat, 27 Jul 2024 11:16:44 +0800',
      qrCodeByURL: [
        {
          url: 'https://mcusercontent.com/75a08b98bc328a8dcf78d9606/images/09ba74eb-b05f-a564-df79-53e4cdc6f53c.jpg',
          decodedContent: [
            'https://form.gov.sg/6101fe896bd2f30011aaf4c6'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190f2309ae35c6d2',
      subject: 'Fwd: Many Exciting, Good Paying Job Opportunities in our Job Portal for ITE Graduates',
      historyId: '29607',
      date: 'Sat, 27 Jul 2024 11:15:53 +0800',
      qrCodeByContentId: [
        {
          cid: 'ii_190f22744b62d7326d2',
          attachmentId: 'ANGjdJ-M5yXJcDRyejnSdcpr0JipKrq1PL1c2gpXiMd6jC6EI0oa4VKe9QJf_oArNRb4ae2IvhZO7OE7BOj_GqcLYS29qz4sUCTQvXA2Z4ydsLOgBkhMyHyFIL9KGLW4YZ3eDVHDPifGnAeNZuRgLTsF7E8Td3sFvfcITcI1SEM04eqpALEHPJmpKh7Er5hJv4ciLlfd2yA0Z9-wRHT7174rjAIypjy606W5mdYdV9B7Y63IwUz8sckrs-BmMsWPooUKA2qrz_vDatb3EVQzmRZreAJaUwIhMUv30JB5x3SS9NrKyDmoj_oU04iVXUWAjUE1SOFbN2Bk2nALoSVgAHwXdvOPvp17iI8vgp0VXKyocHvkNOqpsdKbfsRDR9yVhImqs4s83lAOH9X1rp9V',
          decodedContent: [
            'https://www.instagram.com/itealumni/',
            'https://www.facebook.com/ITEAlumni'
          ],
          totalQRCodeFound: 2
        },
        {
          cid: 'ii_190f22744b62c91aec1',
          attachmentId: 'ANGjdJ_2XGOHh1AS3Vtx02mFNCIKP-DpSz8sChaNxzeFaviwLe5zBsLpxJ8vv4WYrYElyy7S0xxjy5q3CWWlHGI8zgkZCF95zPlEvJ8f_bWswlQ6tIanXM3b_tk6Jh_e35X99t1PjfRQFDck3vWEfHtMuM3brPkaNP2Ely4bjGO9bthU58TRpcHq3sdnhlrK2If0xLygyS9mw22og17RVGd8vI39QzVSF7xY8JnI-OTJbiRRZ4es3lFLStf3DpjSHIRqeja8Ps2oEduCLl4MQZ7Mhy0df585QC-eJvk6UUX20q2JfQPX6Up7xuR9sxD0GLFeJhseF98Y4QN3K2v6YAhch-LFp3_p-StNQfLafI2bOfFAiv9J8FflTHEIPOICLkRvM_2lRYK4cQajgROp',
          decodedContent: [
            'https://uspur.e2i.com.sg/ITE',
            'https://sites.google.com/view/bookyourecg',
            'https://sites.google.com/view/ecg-ce/home',
            'https://sites.google.com/view/virtualchallenge/book-ecg-appointment'
          ],
          totalQRCodeFound: 4
        }
      ]
    },
    {
      messageId: '190f2119dd09ee0e',
      subject: 'Fwd: Exclusive insights for Risk and Compliance Managers - don\'t miss out!',
      historyId: '29628',
      date: 'Sat, 27 Jul 2024 10:42:27 +0800',
      qrCodeByURL: [
        {
          url: 'https://go.ibf.org.sg/l/892591/2023-10-09/g98t7/892591/1696907378NZU0nrZd/qr_code__21_.png',
          decodedContent: [
            'https://us02web.zoom.us/webinar/register/WN_qHoX3DXUS-y_qP3eWt2jXQ'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190e95f5626b2a39',
      subject: 'Test Test',
      historyId: '28144',
      date: 'Thu, 25 Jul 2024 18:10:57 +0800',
      qrCodeByContentId: [
        {
          cid: '190e95f3d0096ff49b41',
          attachmentId: 'ANGjdJ9dE5MqEQkNaX1ssbR9jTwRttD28jj5b3-A8iGS_v8QNm6s5HNqknpTeVQP75fCTrLdwbbvnCI120H1Boo_Qls42YqL470MHAw_d_QPXF10TWUNhpOVpTBPXntHwxD4tFoxHfvH47OdZVE-LuuYbJUsLu9BzYM6F3t2uBfsimbOhTkmgHHW8LOcnX1ZjM5Q53rsbD_K7UaBfKgWaaaDq4U4qg4ztLscRe00zLGkOPxgETTf2SRPm4x5fHVfoszj1xQRjSbTpdkbAnslWH5HYgDWP3854wBObQGfsyve6LfARBMNH7Xez0OAX8k',
          decodedContent: [
            '0002010102111531260207020052044611190861600    26860011SG.COM.NETS01231198500065G99123123590002111119086160003089086160110012990891A6686851800007SG.SGQR01122007073092D9020701.00110306330029040201050242060400000708202307175204000053037025802SG5922BENDEMEER PRAWN NOODLE6009Singapore63040AEB'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190f22775c9d2a35',
      subject: 'Fwd: Monthly Update - Highlights from July',
      historyId: '29700',
      date: 'Sat, 27 Jul 2024 11:00:00 +0800',
      qrCodeByContentId: [
        {
          cid: 'ii_190f22664b8f23245d3',
          attachmentId: 'ANGjdJ-5y7TR8dckE9jKe5o9xV7zLQ2Eq4U4LPcfhj29Nx8aR0N8bJqKm3OvSy0hP6cOvH9RbO1vR7Sf8Q3_G6QhsaB8Y1xYTQpv4QY8ZTloGOaBbhMyHyKGM9KHLW5YZ3eDVHDPifGnAeNZuRgLTsF7E8Td3sFvfcITcI1SEM04eqpALEHPJmpKh7Er5hJv4ciLlfd2yA0Z9-wRHT7174rjAIypjy606W5mdYdV9B7Y63IwUz8sckrs-BmMsWPooUKA2qrz_vDatb3EVQzmRZreAJaUwIhMUv30JB5x3SS9NrKyDmoj_oU04iVXUWAjUE1SOFbN2Bk2nALoSVgAHwXdvOPvp17iI8vgp0VXKyocHvkNOqpsdKbfsRDR9yVhImqs4s83lAOH9X1rp9V',
          decodedContent: [
            'https://www.example.com/newsletter/july',
            'https://www.example.com/events/upcoming'
          ],
          totalQRCodeFound: 2
        }
      ]
    },
    {
      messageId: '190f22887e0d8b27',
      subject: 'Fwd: Invitation to Join the Annual Tech Summit 2024',
      historyId: '29702',
      date: 'Sat, 27 Jul 2024 10:45:30 +0800',
      qrCodeByURL: [
        {
          url: 'https://example.com/images/tech_summit_invite.png',
          decodedContent: [
            'https://example.com/register/techsummit2024'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190f229a4b1d2c89',
      subject: 'Fwd: Important Updates on Your Account',
      historyId: '29704',
      date: 'Sat, 27 Jul 2024 10:30:15 +0800',
      qrCodeByContentId: [
        {
          cid: 'ii_190f229e89df3a5d0',
          attachmentId: 'ANGjdJ9-M5yXJcDRyejnSdcpr0JipKrq1PL1c2gpXiMd6jC6EI0oa4VKe9QJf_oArNRb4ae2IvhZO7OE7BOj_GqcLYS29qz4sUCTQvXA2Z4ydsLOgBkhMyHyFIL9KGLW4YZ3eDVHDPifGnAeNZuRgLTsF7E8Td3sFvfcITcI1SEM04eqpALEHPJmpKh7Er5hJv4ciLlfd2yA0Z9-wRHT7174rjAIypjy606W5mdYdV9B7Y63IwUz8sckrs-BmMsWPooUKA2qrz_vDatb3EVQzmRZreAJaUwIhMUv30JB5x3SS9NrKyDmoj_oU04iVXUWAjUE1SOFbN2Bk2nALoSVgAHwXdvOPvp17iI8vgp0VXKyocHvkNOqpsdKbfsRDR9yVhImqs4s83lAOH9X1rp9V',
          decodedContent: [
            'https://www.example.com/account/updates'
          ],
          totalQRCodeFound: 1
        }
      ]
    },
    {
      messageId: '190f230bb4a5e7d2',
      subject: 'Fwd: Your Subscription is About to Expire!',
      historyId: '29710',
      date: 'Sat, 27 Jul 2024 10:15:45 +0800',
      qrCodeByURL: [
        {
          url: 'https://example.com/images/subscription_expire.png',
          decodedContent: [
            'https://example.com/renew/subscription'
          ],
          totalQRCodeFound: 1
        }
      ]
    }
  ]
};


const EmailScreen: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleSelectMessage = (message) => {
    setSelectedMessage(selectedMessage === message ? null : message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{emailData.emailAddress}</Text>
      <Text style={styles.emailAddress}>--- </Text>
      <FlatList
        data={emailData.messages}
        keyExtractor={(item) => item.messageId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectMessage(item)} style={styles.messageContainer}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.date}>{item.date}</Text>
            {selectedMessage === item && (
              <View style={styles.emailDetailContainer}>
                {item.qrCodeByContentId && (
                  <View>
                    <Text style={styles.qrCodeHeader}>QR Codes by Content ID:</Text>
                    {item.qrCodeByContentId.map((qrCode, index) => (
                      <View key={index} style={styles.qrCodeContainer}>
                        {qrCode.decodedContent.map((url, i) => (
                          <Text key={i} style={styles.qrCodeLink}>{url}</Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
                {item.qrCodeByURL && (
                  <View>
                    <Text style={styles.qrCodeHeader}>QR Codes by URL:</Text>
                    {item.qrCodeByURL.map((qrCode, index) => (
                      <View key={index} style={styles.qrCodeContainer}>
                        <Text style={styles.qrCodeLink}>{qrCode.url}</Text>
                        {qrCode.decodedContent.map((url, i) => (
                          <Text key={i} style={styles.qrCodeLink}>{url}</Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 10,
    paddingBottom: 90, // Add this line to give space for the nav bar
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 10,
    textAlign: 'center',
  },
  emailAddress: {
    fontSize: 18,
    color: '#ff69b4',
    marginBottom: 10,
  },
  emailContainer: {
    paddingBottom: 120, // Add padding to prevent overlap with custom navbar
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  emailDetailContainer: {
    backgroundColor: '#f8f0fc',
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },
  qrCodeHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 5,
  },
  qrCodeContainer: {
    marginBottom: 5,
  },
  qrCodeLink: {
    fontSize: 14,
    color: '#0000ff',
    textDecorationLine: 'underline',
  },
});

export default EmailScreen;
