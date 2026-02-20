using mpNuget;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace ApiCMS
{
    public class SmsHelper
    {
       

        string username = ConfigurationManager.AppSettings["magfa_user"];
        string password = ConfigurationManager.AppSettings["magfa_pass"];
        string domain = ConfigurationManager.AppSettings["magfa_domain"];
        string senderNumber = ConfigurationManager.AppSettings["magfa_no"];

        public List<string> getStatus(List<Int64> refIds)
        {

            com.magfa.sms.SoapSmsQueuableImplementationService sq = new com.magfa.sms.SoapSmsQueuableImplementationService();
            sq.Credentials = new System.Net.NetworkCredential(username, password);
            sq.PreAuthenticate = true;



            var response = sq.getRealMessageStatuses(refIds.ToArray());
            List<string> result = new List<string>();
            foreach (var x in response)
            {
                var str = "Unknown";
                switch (x)
                {
                    case 1:
                        str = "Delivered";
                        break;
                    case 2:
                        str = "Not Delivered To Phone";
                        break;
                    case 8:
                        str = "Delivered To ICT";
                        break;
                    case 16:
                        str = "Not Delivered To ICT";
                        break;
                    case 0:
                        str = "Sending Queue";
                        break;
                    default:
                        break;
                }
                result.Add(str);
            }


            return result;
        }
        public string getStatus(Int64 refid)
        {
            try
            {
                com.magfa.sms.SoapSmsQueuableImplementationService sq = new com.magfa.sms.SoapSmsQueuableImplementationService();
                sq.Credentials = new System.Net.NetworkCredential(username, password);
                sq.PreAuthenticate = true;

                var response = sq.getMessageStatus(refid);


                var str = "Unknown";
                switch (response)
                {
                    case 1:
                        str = "Delivered";
                        break;
                    case 2:
                        str = "Not Delivered To Phone";
                        break;
                    case 8:
                        str = "Delivered To ICT";
                        break;
                    case 16:
                        str = "Not Delivered To ICT";
                        break;
                    case 0:
                        str = "Sending Queue";
                        break;
                    default:
                        break;
                }




                return str;
            }
            catch (Exception ex)
            {
                return "UNKNOWN-ERROR";
            }

        }


        public long[] enqueue(int count, String recipientNumber, String text)
        {
            try
            {
                System.Net.ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                com.magfa.sms.SoapSmsQueuableImplementationService sq = new com.magfa.sms.SoapSmsQueuableImplementationService();

                sq.Credentials = new System.Net.NetworkCredential(username, password);
                sq.PreAuthenticate = true;
                long[] results;

                string[] messages;
                string[] mobiles;
                string[] origs;

                int[] encodings;
                string[] UDH;
                int[] mclass;
                int[] priorities;
                long[] checkingIds;

                messages = new string[count];
                mobiles = new string[count];
                origs = new string[count];

                encodings = new int[count];
                UDH = new string[count];
                mclass = new int[count];
                priorities = new int[count];
                checkingIds = new long[count];


                for (int i = 0; i < count; i++)
                {
                    messages[i] = text;
                    mobiles[i] = recipientNumber;
                    origs[i] = senderNumber;

                    encodings[i] = -1;
                    UDH[i] = "";
                    mclass[i] = -1;
                    priorities[i] = -1;
                    checkingIds[i] = 200 + i;
                }
                var xxx = sq.Url;
                return sq.enqueue(domain, messages, mobiles, origs, encodings, UDH, mclass, priorities, checkingIds);


            }
            catch (Exception ex)
            {
                return new long[] { -1 };
            }

        }

        public string send(string mobile, string name, string message)
        {
            RestClient client = new RestClient("9354957316", "Rhbsms99@");
            var result = client.Send(mobile, "90009105", message, false).Value;
            return result;
        }
    }
}